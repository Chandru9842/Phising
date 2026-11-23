"""
PhishShield SMS Smishing Scanning & Multi-URL Diagnostic API Endpoints
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.database import get_db
from app.models.scan import ScanRecord
from app.ml.sms.predict_sms import (
    scan_sms_comprehensive,
    get_sms_classifier,
    DEFAULT_SMS_MODEL_PATH
)
from app.schemas.sms_scan import SMSScanRequest, SMSScanResponse

logger = logging.getLogger("phishshield.api.sms")

router = APIRouter(prefix="/sms", tags=["SMS Smishing Scanner"])


@router.post("/scan", response_model=SMSScanResponse)
def scan_sms_endpoint(payload: SMSScanRequest, db: Session = Depends(get_db)):
    """
    Performs comprehensive SMS phishing (smishing) detection:
    1. Evaluates text via TF-IDF + Logistic Regression pipeline.
    2. Identifies high-signal smishing keywords.
    3. Extracts all embedded URLs.
    4. Evaluates every URL using existing Random Forest, brand spoofing, and SHAP engines.
    5. Returns composite risk score, actionable recommendations, and logs audit record.
    """
    raw_message = payload.message.strip()
    if not raw_message:
        raise HTTPException(status_code=400, detail="SMS message text cannot be empty.")

    try:
        result = scan_sms_comprehensive(raw_message)
    except FileNotFoundError as e:
        logger.error(f"SMS scanning failed due to missing model: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during SMS scan: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal scan failure: {str(e)}")

    # Persist audit record to SQLite database
    try:
        record = ScanRecord(
            scan_type="sms",
            target_input=raw_message,
            risk_score=result["composite_risk_score"],
            risk_level=result["composite_risk_level"],
            is_phishing=result["is_smishing"],
            is_brand_impersonation=bool(result.get("target_brand")),
            target_brand=result.get("target_brand"),
            impersonation_technique="smishing_brand_spoofing" if result.get("target_brand") else None,
            reasons=result.get("reasons", []),
            shap_features=[
                {"token": kw, "type": "keyword_flag"}
                for kw in result["sms_text_analysis"].get("keywords_detected", [])[:5]
            ],
        )
        db.add(record)
        db.commit()
    except Exception as db_err:
        logger.warning(f"Failed to persist SMS scan record to database: {db_err}")
        db.rollback()

    return result


@router.get("/model-info")
def get_sms_model_diagnostics():
    """Returns trained TF-IDF + Logistic Regression model metadata and evaluation benchmarks."""
    try:
        classifier = get_sms_classifier()
        return {
            "status": "ready",
            "model_path": DEFAULT_SMS_MODEL_PATH,
            "metadata": classifier.metadata,
        }
    except FileNotFoundError as e:
        return {
            "status": "not_trained",
            "message": str(e),
        }
