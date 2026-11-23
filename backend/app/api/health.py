from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas.health import HealthResponse
from app.config import settings
from app.core.brand_registry import INDIAN_BANKING_REGISTRY
import datetime

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint returning dynamic system status, database connectivity,
    and platform environment information derived from actual components.
    """
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        app_name=settings.PROJECT_NAME,
        version="0.1.0",
        environment=settings.ENVIRONMENT,
        services={
            "database": db_status,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "protection_engine": "operational",
            "supported_banks_count": len(INDIAN_BANKING_REGISTRY)
        }
    )
