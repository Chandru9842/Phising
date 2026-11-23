import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base
from app.api.health import router as health_router
from app.api.banks import router as banks_router
from app.api.history import router as history_router
from app.api.urls import router as urls_router
from app.api.sms import router as sms_router
from app.api.screenshot import router as screenshot_router
from app.api.auth import router as auth_router
from app.api.admin_users import router as admin_users_router
from app.api.dossier import router as dossier_router
from app.api.admin_banks import router as admin_banks_router
from app.api.admin_webhooks import router as admin_webhooks_router
from app.api.admin_audit import router as admin_audit_router
from app.core.auth import bootstrap_initial_admin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("phishshield")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            res = conn.execute(text("PRAGMA table_info(audit_logs)")).fetchall()
            cols = [r[1] for r in res]
            if cols and "prev_hash" not in cols:
                conn.execute(text("ALTER TABLE audit_logs ADD COLUMN prev_hash VARCHAR(64)"))
            if cols and "entry_hash" not in cols:
                conn.execute(text("ALTER TABLE audit_logs ADD COLUMN entry_hash VARCHAR(64)"))
            conn.commit()
    except Exception as mig_err:
        logger.warning(f"Audit log table migration check: {mig_err}")

    logger.info("Bootstrapping initial Administrator account if needed...")
    bootstrap_initial_admin()
    logger.info("PhishShield Backend successfully initialized.")
    yield
    logger.info("PhishShield Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Brand-Aware, Explainable Phishing Protection Platform for Indian Banking Customers",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "InternalServerError", "message": str(exc)}
    )

# Direct root & health endpoints
@app.get("/")
def root():
    return {
        "project": "PhishShield",
        "description": "Brand-Aware, Explainable Phishing Protection for Indian Banking Customers",
        "version": "0.1.0",
        "status": "online",
        "docs": "/docs"
    }

# Include routers
app.include_router(health_router, prefix="/api")
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(banks_router, prefix=settings.API_V1_STR)
app.include_router(history_router, prefix=settings.API_V1_STR)
app.include_router(urls_router, prefix=settings.API_V1_STR)
app.include_router(sms_router, prefix=settings.API_V1_STR)
app.include_router(screenshot_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(admin_users_router, prefix=settings.API_V1_STR)
app.include_router(dossier_router, prefix=settings.API_V1_STR)
app.include_router(admin_banks_router, prefix=settings.API_V1_STR)
app.include_router(admin_webhooks_router, prefix=settings.API_V1_STR)
app.include_router(admin_audit_router, prefix=settings.API_V1_STR)

