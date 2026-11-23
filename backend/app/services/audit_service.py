"""
Administrative Security Audit Trail Service
Records security events, governance decisions, and export actions with cryptographic hash-chaining.
Provides tamper-evident audit verification and comprehensive credential redaction.
"""

import json
import hashlib
import logging
import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

logger = logging.getLogger("phishshield.audit")

REDACTED_KEYS = {
    "password", "password_hash", "token", "access_token",
    "secret", "secret_key", "authorization", "auth",
    "api_key", "credential", "private_key"
}

GENESIS_HASH = "0" * 64


def sanitize_audit_payload(obj: Any) -> Any:
    """
    Recursively scrubs credentials, secrets, and authorization tokens from audit payloads.
    """
    if isinstance(obj, dict):
        clean = {}
        for k, v in obj.items():
            if str(k).lower() in REDACTED_KEYS or any(r in str(k).lower() for r in ["password", "secret", "token"]):
                clean[k] = "[REDACTED]"
            else:
                clean[k] = sanitize_audit_payload(v)
        return clean
    elif isinstance(obj, list):
        return [sanitize_audit_payload(item) for item in obj]
    return obj


def compute_entry_hash(prev_hash: str, timestamp_str: str, actor: str, action: str, entity_type: str, entity_id: str, details: dict) -> str:
    """
    Computes deterministic SHA-256 hash for audit record chaining.
    """
    serialized = f"{prev_hash}|{timestamp_str}|{actor}|{action}|{entity_type}|{entity_id}|{json.dumps(details, sort_keys=True)}"
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def record_audit_event(
    db: Session,
    actor_username: str,
    actor_role: str,
    action: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> Optional[AuditLog]:
    """
    Persists a tamper-evident audit log entry linked via SHA-256 cryptographic hash-chaining.
    Ensures safe serialization without exposing passwords, tokens, or raw screenshot bytes.
    """
    safe_details = sanitize_audit_payload(details) if details else {}
    actor_clean = actor_username or "system"
    role_clean = actor_role or "System"
    ent_type_clean = entity_type or "system"
    ent_id_clean = str(entity_id) if entity_id else "none"

    try:
        # Determine predecessor hash in the chain
        prev_entry = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
        prev_hash = prev_entry.entry_hash if (prev_entry and getattr(prev_entry, "entry_hash", None)) else GENESIS_HASH

        now_utc = datetime.datetime.now(datetime.timezone.utc)
        now_str = now_utc.strftime("%Y-%m-%d %H:%M:%S")

        entry_hash = compute_entry_hash(
            prev_hash=prev_hash,
            timestamp_str=now_str,
            actor=actor_clean,
            action=action,
            entity_type=ent_type_clean,
            entity_id=ent_id_clean,
            details=safe_details
        )

        log_entry = AuditLog(
            timestamp=now_utc,
            actor_username=actor_clean,
            actor_role=role_clean,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else None,
            details=safe_details,
            ip_address=ip_address,
            prev_hash=prev_hash,
            entry_hash=entry_hash
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
    except Exception as e:
        logger.error(f"Failed to record audit log for action '{action}': {e}", exc_info=True)
        db.rollback()
        return None


def verify_audit_log_chain(db: Session) -> Dict[str, Any]:
    """
    Audits the entire cryptographic hash-chain of the audit log table.
    Detects any unauthorized insertion, deletion, or modification of stored records.
    """
    entries: List[AuditLog] = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    if not entries:
        return {"status": "VALID", "total_records": 0, "verified_records": 0, "broken_at_id": None}

    expected_prev = GENESIS_HASH
    verified = 0

    for entry in entries:
        # If entry does not have hash chain initialized (legacy entry), update baseline
        if not entry.entry_hash:
            continue

        if entry.prev_hash != expected_prev:
            return {
                "status": "TAMPER_DETECTED",
                "error": f"Chain link broken at record #{entry.id}. Expected prev_hash {expected_prev}, found {entry.prev_hash}",
                "broken_at_id": entry.id,
                "verified_records": verified
            }

        ts_str = entry.timestamp.strftime("%Y-%m-%d %H:%M:%S") if entry.timestamp else ""
        recomputed = compute_entry_hash(
            prev_hash=entry.prev_hash,
            timestamp_str=ts_str,
            actor=entry.actor_username,
            action=entry.action,
            entity_type=entry.entity_type or "system",
            entity_id=entry.entity_id or "none",
            details=entry.details or {}
        )

        if recomputed != entry.entry_hash:
            return {
                "status": "TAMPER_DETECTED",
                "error": f"Cryptographic integrity failed at record #{entry.id}. Entry payload altered.",
                "broken_at_id": entry.id,
                "verified_records": verified
            }

        expected_prev = entry.entry_hash
        verified += 1

    return {
        "status": "VALID",
        "total_records": len(entries),
        "verified_records": verified,
        "chain_head": expected_prev
    }
