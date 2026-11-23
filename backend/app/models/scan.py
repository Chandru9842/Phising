from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from app.database import Base
import datetime

class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(Integer, primary_key=True, index=True)
    scan_type = Column(String(50), nullable=False, index=True) # "url", "sms", "screenshot"
    target_input = Column(Text, nullable=False) # The URL or SMS text
    risk_score = Column(Float, nullable=True) # 0.0 to 100.0 or None when insufficient evidence
    risk_level = Column(String(20), nullable=False) # "SAFE", "SUSPICIOUS", "DANGEROUS"
    is_phishing = Column(Boolean, default=False)
    
    # Brand Impersonation details
    target_brand = Column(String(100), nullable=True) # e.g. "State Bank of India"
    is_brand_impersonation = Column(Boolean, default=False)
    impersonation_technique = Column(String(100), nullable=True) # "typosquatting", "subdomain_spoofing", etc.
    
    # Explainability & Insights
    reasons = Column(JSON, nullable=True) # list of human-readable reasons
    shap_features = Column(JSON, nullable=True) # key feature contributions
    
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    def __repr__(self):
        return f"<ScanRecord(id={self.id}, type={self.scan_type}, risk={self.risk_level})>"

