# ==============================================================================
# PhishShield Production Backend Dockerfile
# Python 3.12-slim with CPU PyTorch, EasyOCR & OpenCV dependencies
# Non-root execution (UID 1000 for Hugging Face Spaces & standard Linux compatibility)
# Multi-port support (7860 for Hugging Face Spaces, 8000 for Docker Compose)
# ==============================================================================

FROM python:3.12-slim AS base

# Prevent Python from writing .pyc files and enable unbuffered streaming
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    EASYOCR_MODULE_PATH=/app/models/easyocr \
    TORCH_HOME=/app/models/torch \
    PORT=7860

# Install system dependencies required by OpenCV and EasyOCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user (UID 1000 for Hugging Face Spaces compatibility)
RUN groupadd -g 1000 phishshield && \
    useradd -u 1000 -g phishshield -s /bin/bash -m phishshield

WORKDIR /app

# Create persistent storage directories with appropriate ownership
RUN mkdir -p /app/data /app/models/easyocr /app/models/torch /tmp/cache && \
    chown -R phishshield:phishshield /app /tmp/cache

# Copy dependency definition
COPY requirements.txt .

# Install dependencies (CPU mode for PyTorch and EasyOCR)
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY --chown=phishshield:phishshield app ./app
COPY --chown=phishshield:phishshield run.py .

# Switch to non-root user
USER phishshield

# Expose backend API ports (7860 for HF Spaces, 8000 for Docker Compose)
EXPOSE 7860 8000

# Container healthcheck targeting the active port
HEALTHCHECK --interval=30s --timeout=5s --start-period=35s --retries=3 \
    CMD curl -f http://localhost:${PORT:-7860}/api/health || curl -f http://localhost:8000/api/health || exit 1

# Launch ASGI production server using configurable PORT env variable
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860} --workers 1"]
