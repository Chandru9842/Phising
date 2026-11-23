import os
from typing import List, Union, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "PhishShield"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./phishshield.db"
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]
    SECRET_KEY: str = "phishshield-default-dev-secret-key"
    GEMINI_API_KEY: str = ""
    ADMIN_INITIAL_PASSWORD: Optional[str] = None
    PBKDF2_ITERATIONS: int = 600000
    LOGIN_RATE_LIMIT_MAX_ATTEMPTS: int = 5
    LOGIN_RATE_LIMIT_WINDOW_SECONDS: int = 60

    # Concurrency and Performance Hardening
    MAX_CONCURRENT_OCR: int = 1
    MAX_OCR_QUEUE_DEPTH: int = 10
    OCR_TIMEOUT_SECONDS: int = 120
    EASYOCR_MODEL_DIR: Optional[str] = None

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            import json
            try:
                return json.loads(v)
            except Exception:
                return ["http://localhost:5173"]
        return v

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore"
    )

settings = Settings()
