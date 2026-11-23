# ==============================================================================
# PhishShield Production Backend Dockerfile
# Python 3.12-slim with CPU PyTorch, EasyOCR & OpenCV dependencies
# Non-root execution, bounded resource usage, and container healthcheck
# ==============================================================================

FROM python:3.12-slim AS base

# Prevent Python from writing .pyc files and enable unbuffered streaming
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    EASYOCR_MODULE_PATH=/app/models/easyocr \
    TORCH_HOME=/app/models/torch

# Install system dependencies required by OpenCV and EasyOCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user
RUN groupadd -g 10001 phishshield && \
    useradd -u 10001 -g phishshield -s /bin/bash -m phishshield

WORKDIR /app

# Create persistent storage directories with appropriate ownership
RUN mkdir -p /app/data /app/models/easyocr /app/models/torch && \
    chown -R phishshield:phishshield /app

# Copy dependency definition
COPY requirements.txt .

# Install dependencies (CPU mode for PyTorch and EasyOCR)
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY --chown=phishshield:phishshield app ./app
COPY --chown=phishshield:phishshield run.py .

# Switch to non-root user
USER phishshield

# Expose backend API port
EXPOSE 8000

# Container healthcheck targeting the zero-dependency health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Launch ASGI production server (single worker with threadpool for CPU OCR stability)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
