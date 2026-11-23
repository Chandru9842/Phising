"""
Administrative Security Audit Trail Model
Tracks security events, administrative changes, and threat export provenance.
"""

import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    actor_username = Column(String(50), nullable=False, index=True)
    actor_role = Column(String(20), nullable=False)
    action = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(50), nullable=True)  # user, bank_registry, webhook, scan_dossier
    entity_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)  # Safe metadata only; never passwords or secrets
    ip_address = Column(String(45), nullable=True)
    prev_hash = Column(String(64), nullable=True)   # SHA-256 link to prior audit record
    entry_hash = Column(String(64), nullable=True)  # Cryptographic tamper-evident record hash

    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', actor='{self.actor_username}')>"
