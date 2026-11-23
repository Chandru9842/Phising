"""
Administrator User & RBAC Management Endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.core.security import hash_password
from app.core.auth import require_role
from app.services.audit_service import record_audit_event

router = APIRouter(prefix="/admin/users", tags=["Administrator User Governance"])


class UserCreateRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = UserRole.VIEWER


class UserUpdateRequest(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


@router.get("", summary="List all registered platform users")
def list_users(
    current_admin: User = Depends(require_role([UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.id.asc()).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "last_login": u.last_login.isoformat() if u.last_login else None
        }
        for u in users
    ]


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create a new user with designated role")
def create_user(
    payload: UserCreateRequest,
    current_admin: User = Depends(require_role([UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    if payload.role not in UserRole.ALL_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{payload.role}'. Must be one of {UserRole.ALL_ROLES}."
        )

    if len(payload.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )

    existing = db.query(User).filter(
        (User.username == payload.username.strip()) | (User.email == payload.email.strip().lower())
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with that username or email already exists."
        )

    new_user = User(
        username=payload.username.strip(),
        email=payload.email.strip().lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    record_audit_event(
        db=db,
        actor_username=current_admin.username,
        actor_role=current_admin.role,
        action="USER_CREATED",
        entity_type="user",
        entity_id=str(new_user.id),
        details={"created_user": new_user.username, "role": new_user.role}
    )

    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "role": new_user.role,
        "is_active": new_user.is_active,
        "created_at": new_user.created_at.isoformat() if new_user.created_at else None
    }


@router.patch("/{user_id}", summary="Update user role, activation status, or password")
def update_user(
    user_id: int,
    payload: UserUpdateRequest,
    current_admin: User = Depends(require_role([UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    changes = {}
    if payload.role is not None:
        if payload.role not in UserRole.ALL_ROLES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid role '{payload.role}'.")
        changes["role"] = f"{target_user.role} -> {payload.role}"
        target_user.role = payload.role

    if payload.is_active is not None:
        if target_user.id == current_admin.id and payload.is_active is False:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Administrators cannot deactivate themselves.")
        changes["is_active"] = f"{target_user.is_active} -> {payload.is_active}"
        target_user.is_active = payload.is_active

    if payload.password:
        if len(payload.password) < 8:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be >= 8 chars.")
        target_user.password_hash = hash_password(payload.password)
        changes["password"] = "PASSWORD_RESET"

    db.commit()

    record_audit_event(
        db=db,
        actor_username=current_admin.username,
        actor_role=current_admin.role,
        action="USER_UPDATED",
        entity_type="user",
        entity_id=str(target_user.id),
        details={"target_username": target_user.username, "changes": changes}
    )

    return {"message": "User updated successfully.", "user_id": target_user.id, "changes": changes}


@router.delete("/{user_id}", summary="Delete user account")
def delete_user(
    user_id: int,
    current_admin: User = Depends(require_role([UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if target_user.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Administrators cannot delete their own account.")

    username = target_user.username
    db.delete(target_user)
    db.commit()

    record_audit_event(
        db=db,
        actor_username=current_admin.username,
        actor_role=current_admin.role,
        action="USER_DELETED",
        entity_type="user",
        entity_id=str(user_id),
        details={"deleted_username": username}
    )

    return {"message": f"User '{username}' deleted successfully."}
