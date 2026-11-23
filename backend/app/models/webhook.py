"""
Alert Webhook Configuration Model
Enables administrator-configured outbound alerts for critical threat events.
"""

import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Text
from app.database import Base


class WebhookConfig(Base):
    __tablename__ = "webhook_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=False)
    events = Column(JSON, default=lambda: ["CRITICAL_THREAT_DETECTED"])
    secret_token = Column(String(255), nullable=True)  # Optional header token
    last_delivery_status = Column(String(50), nullable=True)  # "SUCCESS", "FAILED", "BLOCKED_SSRF"
    last_delivery_at = Column(DateTime, nullable=True)
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    def __repr__(self):
        return f"<WebhookConfig(id={self.id}, name='{self.name}', active={self.is_active})>"
