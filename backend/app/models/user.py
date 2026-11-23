"""
User and Role-Based Access Control (RBAC) Model
"""

import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base


class UserRole:
    VIEWER = "Viewer"
    ANALYST = "Analyst"
    ADMINISTRATOR = "Administrator"

    ALL_ROLES = [VIEWER, ANALYST, ADMINISTRATOR]


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default=UserRole.VIEWER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    last_login = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"
