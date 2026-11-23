"""
Pydantic Schemas for PhishShield Screenshot Upload & Safe Processing
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from app.schemas.url_scan import URLScanResponse


class ScreenshotUploadResponse(BaseModel):
    success: bool = True
    filename: str
    detected_format: str
    image_width: int
    image_height: int
    file_size: int
    aspect_ratio: float
    color_channels: int
    processing_status: str
    upload_id: str
    analyzed_at: str
    normalization_details: Optional[Dict[str, Any]] = None


class TextBlockItem(BaseModel):
    text: str
    confidence: float
    bounding_box: List[List[int]] = []


class ScreenshotOCRResponse(BaseModel):
    success: bool = True
    filename: str
    processing_status: str = "ocr_completed"
    ocr_engine: str = "EasyOCR"
    language: str = "en"
    extracted_text: str = ""
    text_blocks: List[TextBlockItem] = []
    text_block_count: int = 0
    processing_time_ms: float
    detected_format: Optional[str] = None
    image_width: Optional[int] = None
    image_height: Optional[int] = None
    analyzed_at: Optional[str] = None


# =============================================================================
# Phase 5C: Screenshot Threat Intelligence & Explainability Schemas
# =============================================================================

class ExtractedURLCandidate(BaseModel):
    original_text: str
    normalized_url: str
    reconstruction_status: str = "original"  # "original" | "normalized_scheme" | "reconstructed_domain" | "unresolved"
    ocr_confidence: float = 0.0
    scan_status: str = "completed"  # "completed" | "failed" | "unscannable"
    url_scan_result: Optional[URLScanResponse] = None
    brand_analysis: Optional[Dict[str, Any]] = None
    scan_error: Optional[str] = None


class BankBrandEvidence(BaseModel):
    brand_name: str
    detection_source: str  # "ocr_text" | "url_domain" | "cross_verified"
    primary_domain: Optional[str] = None
    official_domains: List[str] = []
    is_official_match: bool = False
    domain_mismatch_detected: bool = False
    mismatch_details: Optional[str] = None
    confidence_score: float = 1.0


class SocialEngineeringIndicator(BaseModel):
    category: str  # "credential_harvesting" | "otp_interception" | "urgency_coercion" | "kyc_fraud" | "remote_access_trojan" | "financial_lure" | "safety_advisory"
    label: str
    matched_text: str
    severity: str  # "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "BENIGN_ADVISORY"
    explanation: str


class ScreenshotAssessment(BaseModel):
    risk_level: str  # "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "INSUFFICIENT_EVIDENCE"
    risk_score: Optional[float] = None
    summary: str
    confidence: str = "medium"  # "high" | "medium" | "limited" | "insufficient"
    key_threat_factors: List[str] = []
    reasons: List[str] = []


class ScreenshotThreatAnalysisResponse(BaseModel):
    success: bool = True
    analysis_status: str = "completed"
    filename: str
    upload_id: str
    screenshot_assessment: ScreenshotAssessment
    ocr_summary: Dict[str, Any]
    extracted_urls: List[ExtractedURLCandidate] = []
    bank_brand_evidence: List[BankBrandEvidence] = []
    social_engineering_indicators: List[SocialEngineeringIndicator] = []
    evidence: List[Dict[str, Any]] = []
    recommendations: List[str] = []
    processing_time_ms: float
    analyzed_at: str


