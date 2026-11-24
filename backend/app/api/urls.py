"""
PhishShield URL Scanning and Model Diagnostics API Endpoints
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.database import get_db
from app.models.scan import ScanRecord
from app.ml.predict import scan_url_full, get_classifier, DEFAULT_MODEL_PATH
from app.schemas.url_scan import URLScanRequest, URLScanResponse
from app.core.localization import normalize_language_code, localize_unified_risk_assessment

logger = logging.getLogger("phishshield.api.urls")

router = APIRouter(prefix="/urls", tags=["URL Scanner"])


@router.post("/scan", response_model=URLScanResponse)
def scan_url(
    payload: URLScanRequest,
    accept_language: Optional[str] = Header(None, alias="Accept-Language"),
    db: Session = Depends(get_db)
):
    """
    Performs comprehensive Machine Learning and Brand-Aware cybersecurity scanning:
    1. Extracts 26 lexical, structural, and brand features.
    2. Evaluates via trained Random Forest model.
    3. Runs Indian Banking Brand Impersonation and Typosquatting checks.
    4. Computes SHAP TreeExplainer feature attributions for explainability.
    5. Calibrates unified Zero-Trust risk score and actionable user recommendations.
    6. Persists audit record to database.
    """
    raw_url = payload.url.strip()
    if not raw_url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    try:
        result = scan_url_full(raw_url)
    except FileNotFoundError as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during URL scan: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal scan failure: {str(e)}")

    # Persist scan to SQLite database for audit trail
    try:
        brand_data = result.get("brand_analysis", {})
        risk_data = result.get("risk_assessment", {})
        shap_data = result.get("shap_explanation", {})

        top_shap_summary = [
            {"name": c["feature_name"], "shap": c["shap_value"], "dir": c["direction"]}
            for c in shap_data.get("top_positive_contributors", [])[:3]
        ]

        record = ScanRecord(
            scan_type="url",
            target_input=raw_url,
            risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            is_phishing=result["is_phishing"],
            is_brand_impersonation=brand_data.get("impersonation_suspected", False),
            target_brand=brand_data.get("detected_brand"),
            impersonation_technique=brand_data.get("match_type"),
            reasons=risk_data.get("reasons", []),
            shap_features=top_shap_summary,
        )
        db.add(record)
        db.commit()
    except Exception as db_err:
        logger.warning(f"Failed to persist scan record to database: {db_err}")
        db.rollback()

    # Localize risk assessment if Accept-Language header is specified
    lang = normalize_language_code(accept_language)
    if "risk_assessment" in result and result["risk_assessment"]:
        localize_unified_risk_assessment(result["risk_assessment"], lang=lang)

    return result


@router.get("/model-info")
def get_model_diagnostics():
    """Returns trained Random Forest model metadata, evaluation metrics, and feature importances."""
    try:
        classifier = get_classifier()
        return {
            "status": "ready",
            "model_path": DEFAULT_MODEL_PATH,
            "metadata": classifier.metadata,
        }
    except FileNotFoundError as e:
        return {
            "status": "not_trained",
            "message": str(e),
        }
