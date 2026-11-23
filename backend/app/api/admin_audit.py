"""
Administrator Security Audit Trail Viewer Endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.audit import AuditLog
from app.core.auth import require_role

router = APIRouter(prefix="/admin/audit-logs", tags=["Administrator Audit Trail"])


@router.get("", summary="Query paginated administrative security audit trail")
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    action: Optional[str] = Query(None),
    actor: Optional[str] = Query(None),
    current_admin: User = Depends(require_role([UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if actor:
        query = query.filter(AuditLog.actor_username == actor)

    total_count = query.count()
    records = query.order_by(AuditLog.id.desc()).offset(offset).limit(limit).all()

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "logs": [
            {
                "id": r.id,
                "timestamp": r.timestamp.isoformat() if r.timestamp else None,
                "actor_username": r.actor_username,
                "actor_role": r.actor_role,
                "action": r.action,
                "entity_type": r.entity_type,
                "entity_id": r.entity_id,
                "details": r.details,
                "ip_address": r.ip_address
            }
            for r in records
        ]
    }
