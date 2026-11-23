"""
Managed Dynamic Indian Banking Whitelist Registry Model
Allows Administrators to add, update, and manage approved institutional domains.
"""

import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from app.database import Base


class ManagedBankRecord(Base):
    __tablename__ = "managed_bank_registry"

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String(100), unique=True, index=True, nullable=False)
    primary_domain = Column(String(255), nullable=False)
    official_domains = Column(JSON, nullable=False)  # List of approved domains
    keywords = Column(JSON, nullable=False)  # List of brand keywords
    category = Column(String(50), default="Commercial Bank")
    is_custom = Column(Boolean, default=True)  # True if added via admin UI
    is_active = Column(Boolean, default=True)
    created_by = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    def __repr__(self):
        return f"<ManagedBankRecord(id={self.id}, brand='{self.brand_name}', domain='{self.primary_domain}')>"
