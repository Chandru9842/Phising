"""
Pydantic Schemas for PhishShield URL Scanning, Brand Analysis & SHAP Explainability
"""

from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class URLScanRequest(BaseModel):
    url: str


class BrandMatchItem(BaseModel):
    detected_brand: Optional[str] = None
    official_domain: Optional[str] = None
    submitted_domain: str
    similarity_score: float
    edit_distance: int
    match_type: str
    is_official_domain: bool
    impersonation_suspected: bool
    reasons: List[str] = []


class BrandDetectionResponse(BaseModel):
    detected_brand: Optional[str] = None
    official_domain: Optional[str] = None
    matched_official_domain: Optional[str] = None
    submitted_domain: str
    similarity_score: float
    edit_distance: int
    match_type: str
    is_official_domain: bool
    impersonation_suspected: bool
    reasons: List[str] = []
    all_matches: List[BrandMatchItem] = []


class ShapFeatureContribution(BaseModel):
    feature_name: str
    feature_value: Any
    shap_value: float
    abs_shap_value: float
    direction: str
    description: str


class ShapExplanationResponse(BaseModel):
    base_value: float
    model_output: float
    top_positive_contributors: List[ShapFeatureContribution] = []
    top_negative_contributors: List[ShapFeatureContribution] = []
    all_feature_contributions: List[ShapFeatureContribution] = []
    summary: str


class RiskAssessmentResponse(BaseModel):
    risk_score: float
    risk_level: str
    is_phishing: bool
    recommendation: str
    recommendation_text: str
    reasons: List[str] = []
    factors: Dict[str, Any] = {}


class URLScanResponse(BaseModel):
    url: str
    is_phishing: bool
    risk_score: float
    risk_level: str
    probabilities: Dict[str, float]
    brand_impersonation_flag: bool
    features: Dict[str, Any]
    model_version: str
    analyzed_at: str
    brand_analysis: Optional[BrandDetectionResponse] = None
    shap_explanation: Optional[ShapExplanationResponse] = None
    risk_assessment: Optional[RiskAssessmentResponse] = None
