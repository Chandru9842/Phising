from fastapi import APIRouter
from app.core.brand_registry import INDIAN_BANKING_REGISTRY

router = APIRouter(prefix="/banks", tags=["Banking Registry"])

@router.get("")
def list_registered_banks():
    """Returns the list of Indian banks currently protected under the registry."""
    return {
        "total_banks": len(INDIAN_BANKING_REGISTRY),
        "banks": INDIAN_BANKING_REGISTRY
    }

