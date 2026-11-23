from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.models.scan import ScanRecord
from pydantic import BaseModel, ConfigDict
import datetime

router = APIRouter(prefix="/history", tags=["Scan History"])


class ScanItemResponse(BaseModel):
    id: int
    scan_type: str
    target_input: str
    risk_score: Optional[float] = None
    risk_level: str
    is_phishing: bool
    target_brand: Optional[str] = None
    is_brand_impersonation: bool = False
    impersonation_technique: Optional[str] = None
    reasons: Optional[List[str]] = None
    shap_features: Optional[List[Dict[str, Any]]] = None
    created_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=List[ScanItemResponse])
def get_scan_history(
    limit: int = Query(20, ge=1, le=200),
    scan_type: Optional[str] = Query(None, description="Filter by scan type ('url', 'sms', 'screenshot')"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    search: Optional[str] = Query(None, description="Search term for target_input or target_brand"),
    db: Session = Depends(get_db)
):
    """Retrieve recent scans ordered by creation date with optional filtering."""
    query = db.query(ScanRecord)

    if scan_type and scan_type.upper() != "ALL":
        query = query.filter(ScanRecord.scan_type == scan_type.lower())

    if risk_level and risk_level.upper() != "ALL":
        level_upper = risk_level.upper()
        if level_upper == "PHISHING":
            query = query.filter(
                (ScanRecord.is_phishing == True) | (ScanRecord.risk_level.in_(["CRITICAL", "HIGH"]))
            )
        elif level_upper == "SUSPICIOUS":
            query = query.filter(ScanRecord.risk_level.in_(["SUSPICIOUS", "MEDIUM"]))
        elif level_upper == "SAFE":
            query = query.filter(
                (ScanRecord.risk_level.in_(["SAFE", "LOW"])) & (ScanRecord.is_phishing == False)
            )
        elif level_upper == "INSUFFICIENT_EVIDENCE":
            query = query.filter(ScanRecord.risk_level == "INSUFFICIENT_EVIDENCE")
        else:
            query = query.filter(ScanRecord.risk_level == level_upper)

    if search and search.strip():
        s = f"%{search.strip().lower()}%"
        query = query.filter(
            ScanRecord.target_input.ilike(s) | ScanRecord.target_brand.ilike(s)
        )

    scans = query.order_by(desc(ScanRecord.created_at)).limit(limit).all()
    return scans


@router.get("/stats")
def get_scan_stats(db: Session = Depends(get_db)):
    """Summary metrics for the dashboard."""
    total = db.query(ScanRecord).count()
    phishing_count = db.query(ScanRecord).filter(
        (ScanRecord.is_phishing == True) | (ScanRecord.risk_level.in_(["CRITICAL", "HIGH"]))
    ).count()
    brand_impersonations = db.query(ScanRecord).filter(ScanRecord.is_brand_impersonation == True).count()
    safe_count = db.query(ScanRecord).filter(
        (ScanRecord.risk_level.in_(["SAFE", "LOW"])) & (ScanRecord.is_phishing == False)
    ).count()

    # Empirical breakdown counts across all 3 scanning vectors
    url_count = db.query(ScanRecord).filter(ScanRecord.scan_type == "url").count()
    sms_count = db.query(ScanRecord).filter(ScanRecord.scan_type == "sms").count()
    screenshot_count = db.query(ScanRecord).filter(ScanRecord.scan_type == "screenshot").count()

    return {
        "total_scans": total,
        "phishing_detected": phishing_count,
        "brand_impersonations": brand_impersonations,
        "safe_scans": safe_count,
        "scan_types": {
            "url": url_count,
            "sms": sms_count,
            "screenshot": screenshot_count,
        },
        "protection_status": "Active",
        "system_version": "0.1.0"
    }


@router.get("/{record_id}", response_model=ScanItemResponse)
def get_scan_record_by_id(record_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed scan audit dossier by ID."""
    record = db.query(ScanRecord).filter(ScanRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Scan record #{record_id} not found.")
    return record
