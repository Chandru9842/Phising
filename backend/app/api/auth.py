"""
Authentication Endpoints & Session Management
"""

import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.core.security import (
    verify_password,
    create_access_token,
    hash_password,
    needs_rehash,
    dummy_verify_password,
    login_rate_limiter
)
from app.core.auth import get_current_user
from app.services.audit_service import record_audit_event
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class SetupAdminRequest(BaseModel):
    username: str
    email: str
    password: str


@router.post("/login", response_model=LoginResponse, summary="Authenticate user and issue JWT token")
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Authenticates user against stored PBKDF2 password hashes and issues a signed JWT token.
    Enforces in-memory sliding window rate limiting and constant-time failure pads.
    Automatically upgrades legacy password hashes to modern iteration counts upon success.
    """
    forwarded = request.headers.get("x-forwarded-for")
    client_ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "127.0.0.1")
    raw_user = payload.username.strip()

    # 1. Check Rate Limiter
    is_limited, retry_after = login_rate_limiter.is_rate_limited(client_ip, raw_user)
    if is_limited:
        record_audit_event(
            db=db,
            actor_username=raw_user,
            actor_role="Unauthenticated",
            action="USER_LOGIN_THROTTLED",
            entity_type="user",
            details={"ip": client_ip, "retry_after_seconds": retry_after},
            ip_address=client_ip
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Please wait {retry_after} seconds before trying again.",
            headers={"Retry-After": str(retry_after)}
        )

    # 2. Query user and verify credentials
    user = db.query(User).filter(User.username == raw_user).first()
    
    if not user:
        # Prevent timing-based username enumeration by executing dummy hash work
        dummy_verify_password(payload.password)
        login_rate_limiter.record_failure(client_ip, raw_user)
        record_audit_event(
            db=db,
            actor_username=raw_user,
            actor_role="Unauthenticated",
            action="USER_LOGIN_FAILED",
            entity_type="user",
            details={"reason": "Invalid credentials provided"},
            ip_address=client_ip
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not verify_password(payload.password, user.password_hash):
        login_rate_limiter.record_failure(client_ip, raw_user)
        record_audit_event(
            db=db,
            actor_username=raw_user,
            actor_role="Unauthenticated",
            action="USER_LOGIN_FAILED",
            entity_type="user",
            details={"reason": "Invalid credentials provided"},
            ip_address=client_ip
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        record_audit_event(
            db=db,
            actor_username=user.username,
            actor_role=user.role,
            action="USER_LOGIN_REJECTED",
            entity_type="user",
            entity_id=str(user.id),
            details={"reason": "Account deactivated"},
            ip_address=client_ip
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact an administrator."
        )

    # 3. Successful authentication - reset failure tracker
    login_rate_limiter.reset(client_ip, raw_user)

    # 4. Transparently upgrade legacy password hashes if needed
    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(payload.password)

    # 5. Update last login
    user.last_login = datetime.datetime.now(datetime.timezone.utc)
    db.commit()

    token = create_access_token(data={"sub": user.username, "role": user.role, "uid": user.id})

    record_audit_event(
        db=db,
        actor_username=user.username,
        actor_role=user.role,
        action="USER_LOGIN_SUCCESS",
        entity_type="user",
        entity_id=str(user.id),
        details={"role": user.role},
        ip_address=client_ip
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None
        }
    }


@router.post("/setup-admin", summary="Bootstrap initial Administrator if system has 0 admins")
def setup_initial_admin(payload: SetupAdminRequest, request: Request, db: Session = Depends(get_db)):
    """
    Allows bootstrapping the first Administrator if no admin accounts exist.
    Enforces minimum 12 characters in production, 8 in development.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    admin_count = db.query(User).filter(User.role == UserRole.ADMINISTRATOR).count()
    if admin_count > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator account already exists. Contact existing administrator for access."
        )

    is_prod = getattr(settings, "ENVIRONMENT", "").lower() == "production"
    min_len = 12 if is_prod else 8
    if len(payload.password) < min_len:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password must be at least {min_len} characters long for {'production' if is_prod else 'system'} security."
        )

    admin = User(
        username=payload.username.strip(),
        email=payload.email.strip().lower(),
        password_hash=hash_password(payload.password),
        role=UserRole.ADMINISTRATOR,
        is_active=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    record_audit_event(
        db=db,
        actor_username=admin.username,
        actor_role=admin.role,
        action="INITIAL_ADMIN_BOOTSTRAP",
        entity_type="user",
        entity_id=str(admin.id),
        details={"username": admin.username, "email": admin.email},
        ip_address=client_ip
    )

    return {"message": "Initial Administrator created successfully. You may now login.", "username": admin.username}


@router.get("/me", summary="Get authenticated user session details")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None
    }
