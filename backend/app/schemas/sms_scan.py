"""
Pydantic Schemas for PhishShield SMS Phishing & Multi-URL Scanning
"""

from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.schemas.url_scan import URLScanResponse


class SMSScanRequest(BaseModel):
    message: str


class SMSTextAnalysisResponse(BaseModel):
    raw_message: str
    cleaned_text: str
    is_smishing: bool
    sms_risk_score: float
    sms_risk_level: str
    probabilities: Dict[str, float]
    keywords_detected: List[str] = []
    model_version: str


class SMSScanResponse(BaseModel):
    message: str
    is_smishing: bool
    composite_risk_score: float
    composite_risk_level: str
    recommendation: str
    recommendation_text: str
    sms_text_analysis: SMSTextAnalysisResponse
    extracted_urls: List[str] = []
    url_count: int
    url_scan_results: List[URLScanResponse] = []
    target_brand: Optional[str] = None
    reasons: List[str] = []
    analyzed_at: str
