"""
Authentication Dependencies, Role-Based Access Control (RBAC) & Bootstrap Service
"""

import logging
from typing import List, Optional
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.models.user import User, UserRole
from app.core.security import decode_access_token, hash_password
from app.config import settings

logger = logging.getLogger("phishshield.auth")


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Validates JWT Bearer token and returns authenticated active user.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header. Bearer token required.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    username: str = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject identifier.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user no longer exists.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Contact an administrator."
        )

    return user


def require_role(allowed_roles: List[str]):
    """
    Enforces Role-Based Access Control (RBAC).
    Hierarchy: Administrator > Analyst > Viewer
    """
    async def _role_checker(current_user: User = Depends(get_current_user)) -> User:
        # Administrator has access to all roles
        if current_user.role == UserRole.ADMINISTRATOR:
            return current_user

        if current_user.role not in allowed_roles:
            logger.warning(
                f"RBAC Denied: User '{current_user.username}' with role '{current_user.role}' "
                f"attempted to access endpoint requiring {allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Action requires one of the following roles: {allowed_roles}. Your role: '{current_user.role}'."
            )
        return current_user

    return _role_checker


def bootstrap_initial_admin():
    """
    Idempotent bootstrap function: Ensures an Administrator exists in the system.
    Created on application startup if database is empty.
    
    Security Hardening:
    In production mode (ENVIRONMENT == "production"), automatic predictable credentials
    are strictly prohibited. Bootstrapping requires an explicit ADMIN_INITIAL_PASSWORD
    environment variable or must be performed via /api/v1/auth/setup-admin.
    """
    import os
    db = SessionLocal()
    try:
        admin_count = db.query(User).filter(User.role == UserRole.ADMINISTRATOR).count()
        if admin_count == 0:
            is_prod = getattr(settings, "ENVIRONMENT", "").lower() == "production"
            env_pass = os.environ.get("ADMIN_INITIAL_PASSWORD") or getattr(settings, "ADMIN_INITIAL_PASSWORD", None)

            if is_prod and not env_pass:
                logger.warning(
                    "SECURITY NOTICE: Production environment detected with 0 administrators and no "
                    "ADMIN_INITIAL_PASSWORD configured. Skipping automatic administrator bootstrap. "
                    "Initial administrator must be provisioned via /api/v1/auth/setup-admin or ADMIN_INITIAL_PASSWORD."
                )
                return

            initial_password = env_pass or "PhishShieldAdmin#2026"
            logger.info("No Administrator account found. Bootstrapping initial Administrator account...")
            initial_admin = User(
                username="admin",
                email="admin@phishshield.internal",
                password_hash=hash_password(initial_password),
                role=UserRole.ADMINISTRATOR,
                is_active=True
            )
            db.add(initial_admin)
            db.commit()
            logger.info("Initial Administrator bootstrapped successfully: username='admin'")
    except Exception as exc:
        logger.error(f"Failed to bootstrap initial admin: {exc}", exc_info=True)
        db.rollback()
    finally:
        db.close()
