"""
Administrator Indian Bank Registry Governance Endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.bank_registry import ManagedBankRecord
from app.core.brand_registry import INDIAN_BANKING_REGISTRY
from app.core.auth import require_role
from app.services.bank_admin import add_managed_bank, get_active_banking_registry
from app.services.audit_service import record_audit_event

router = APIRouter(prefix="/admin/banks", tags=["Administrator Bank Registry"])


class BankCreateRequest(BaseModel):
    brand_name: str
    primary_domain: str
    official_domains: List[str]
    keywords: List[str]
    category: str = "Commercial Bank"


@router.get("", summary="List all active institutions in managed registry (canonical + custom)")
def list_managed_banks(
    current_admin: User = Depends(require_role([UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    unified = get_active_banking_registry(db)
    return {
        "total_institutions": len(unified),
        "canonical_count": len(INDIAN_BANKING_REGISTRY),
        "custom_count": len(unified) - len(INDIAN_BANKING_REGISTRY),
        "institutions": unified
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Add approved banking institution to whitelist")
def create_managed_bank(
    payload: BankCreateRequest,
    current_admin: User = Depends(require_role([UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    try:
        bank = add_managed_bank(
            db=db,
            brand_name=payload.brand_name,
            primary_domain=payload.primary_domain,
            official_domains=payload.official_domains,
            keywords=payload.keywords,
            category=payload.category,
            created_by=current_admin.username
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

    record_audit_event(
        db=db,
        actor_username=current_admin.username,
        actor_role=current_admin.role,
        action="BANK_REGISTRY_ENTRY_ADDED",
        entity_type="bank_registry",
        entity_id=str(bank.id),
        details={"brand_name": bank.brand_name, "primary_domain": bank.primary_domain}
    )

    return {
        "id": bank.id,
        "brand_name": bank.brand_name,
        "primary_domain": bank.primary_domain,
        "official_domains": bank.official_domains,
        "is_custom": True,
        "message": f"Successfully registered approved institution '{bank.brand_name}'."
    }


@router.delete("/{bank_id}", summary="Remove custom institution from whitelist (canonical banks protected)")
def delete_managed_bank(
    bank_id: int,
    current_admin: User = Depends(require_role([UserRole.ADMINISTRATOR])),
    db: Session = Depends(get_db)
):
    bank = db.query(ManagedBankRecord).filter(ManagedBankRecord.id == bank_id).first()
    if not bank:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Custom bank record not found.")

    brand_name = bank.brand_name
    db.delete(bank)
    db.commit()

    record_audit_event(
        db=db,
        actor_username=current_admin.username,
        actor_role=current_admin.role,
        action="BANK_REGISTRY_ENTRY_REMOVED",
        entity_type="bank_registry",
        entity_id=str(bank_id),
        details={"removed_brand": brand_name}
    )

    return {"message": f"Custom institution '{brand_name}' removed from whitelist."}
