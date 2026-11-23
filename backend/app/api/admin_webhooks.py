"""
Administrator Webhook Alert Governance Endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session
import httpx

from app.database import get_db
from app.models.user import User, UserRole
from app.models.webhook import WebhookConfig
from app.core.auth import require_role
from app.services.webhook_service import validate_webhook_url_security, build_alert_payload
from app.services.audit_service import record_audit_event

router = APIRouter(prefix="/admin/webhooks", tags=["Administrator Alert Webhooks"])


class WebhookCreateRequest(BaseModel):
    name: str
    url: str
    is_active: bool = False
    events: List[str] = ["CRITICAL_THREAT_DETECTED"]
    secret_token: Optional[str] = None


@router.get("", summary="List all configured alert webhooks")
def list_webhooks(
    current_admin: User = Depends(require_role([UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    hooks = db.query(WebhookConfig).order_by(WebhookConfig.id.asc()).all()
    return [
        {
            "id": h.id,
            "name": h.name,
            "url": h.url,
            "is_active": h.is_active,
            "events": h.events,
            "has_secret_token": bool(h.secret_token),
            "last_delivery_status": h.last_delivery_status,
            "last_delivery_at": h.last_delivery_at.isoformat() if h.last_delivery_at else None,
            "last_error": h.last_error,
            "created_at": h.created_at.isoformat() if h.created_at else None
        }
        for h in hooks
    ]


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create alert webhook with SSRF validation")
def create_webhook(
    payload: WebhookCreateRequest,
    current_admin: User = Depends(require_role([UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    try:
        validate_webhook_url_security(payload.url)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook Security Validation Failed: {str(ve)}"
        )

    hook = WebhookConfig(
        name=payload.name.strip(),
        url=payload.url.strip(),
        is_active=payload.is_active,
        events=payload.events,
        secret_token=payload.secret_token
    )
    db.add(hook)
    db.commit()
    db.refresh(hook)

    record_audit_event(
        db=db,
        actor_username=current_admin.username,
        actor_role=current_admin.role,
        action="WEBHOOK_CREATED",
        entity_type="webhook",
        entity_id=str(hook.id),
        details={"name": hook.name, "url_destination": hook.url, "is_active": hook.is_active}
    )

    return {
        "id": hook.id,
        "name": hook.name,
        "url": hook.url,
        "is_active": hook.is_active,
        "message": "Alert webhook configured successfully."
    }


@router.post("/{webhook_id}/test", summary="Dispatch safe synthetic test ping to webhook")
async def test_webhook(
    webhook_id: int,
    current_admin: User = Depends(require_role([UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    hook = db.query(WebhookConfig).filter(WebhookConfig.id == webhook_id).first()
    if not hook:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found.")

    try:
        validate_webhook_url_security(hook.url)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

    test_payload = build_alert_payload(
        scan_id=0,
        scan_type="test_verification",
        raw_input="https://test.phishshield.internal",
        risk_level="CRITICAL",
        risk_score=99.9,
        brand="State Bank of India (Simulated Test)"
    )

    headers = {"Content-Type": "application/json"}
    if hook.secret_token:
        headers["X-PhishShield-Token"] = hook.secret_token

    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=False) as client:
            resp = await client.post(hook.url, json=test_payload, headers=headers)
            hook.last_delivery_status = f"TEST SUCCESS (HTTP {resp.status_code})"
            hook.last_error = None
            db.commit()
            return {"status": "success", "http_code": resp.status_code, "detail": "Test alert payload accepted."}
    except Exception as e:
        hook.last_delivery_status = "TEST FAILED"
        hook.last_error = str(e)
        db.commit()
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Egress test failed: {e}")


@router.delete("/{webhook_id}", summary="Delete webhook configuration")
def delete_webhook(
    webhook_id: int,
    current_admin: User = Depends(require_role([UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    hook = db.query(WebhookConfig).filter(WebhookConfig.id == webhook_id).first()
    if not hook:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found.")

    name = hook.name
    db.delete(hook)
    db.commit()

    record_audit_event(
        db=db,
        actor_username=current_admin.username,
        actor_role=current_admin.role,
        action="WEBHOOK_DELETED",
        entity_type="webhook",
        entity_id=str(webhook_id),
        details={"name": name}
    )

    return {"message": f"Webhook '{name}' deleted successfully."}
