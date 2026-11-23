"""
Threat Dossier Export Endpoints (PDF & Structured JSON)
Protected by RBAC: Requires Analyst or Administrator role.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.scan import ScanRecord
from app.models.user import User, UserRole
from app.core.auth import require_role
from app.services.dossier_export import generate_threat_dossier_json, generate_threat_dossier_pdf
from app.services.audit_service import record_audit_event

router = APIRouter(prefix="/dossier", tags=["Threat Dossier Export"])


@router.get("/{scan_id}/json", summary="Export scan threat dossier as structured JSON")
def export_dossier_json(
    scan_id: int,
    request: Request,
    current_user: User = Depends(require_role([UserRole.ANALYST, UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    scan = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan record #{scan_id} not found."
        )

    dossier = generate_threat_dossier_json(scan)
    client_ip = request.client.host if request.client else "127.0.0.1"

    record_audit_event(
        db=db,
        actor_username=current_user.username,
        actor_role=current_user.role,
        action="DOSSIER_EXPORT_JSON",
        entity_type="scan_dossier",
        entity_id=str(scan.id),
        details={"scan_type": scan.scan_type, "risk_level": scan.risk_level},
        ip_address=client_ip
    )

    return dossier


@router.get("/{scan_id}/pdf", summary="Export scan threat dossier as professional forensic PDF")
def export_dossier_pdf(
    scan_id: int,
    request: Request,
    current_user: User = Depends(require_role([UserRole.ANALYST, UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    scan = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan record #{scan_id} not found."
        )

    try:
        pdf_bytes = generate_threat_dossier_pdf(scan)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate threat dossier PDF: {exc}"
        )

    client_ip = request.client.host if request.client else "127.0.0.1"

    record_audit_event(
        db=db,
        actor_username=current_user.username,
        actor_role=current_user.role,
        action="DOSSIER_EXPORT_PDF",
        entity_type="scan_dossier",
        entity_id=str(scan.id),
        details={"scan_type": scan.scan_type, "risk_level": scan.risk_level},
        ip_address=client_ip
    )

    filename = f"phishshield-threat-dossier-{scan.id:06d}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
