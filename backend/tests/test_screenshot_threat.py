"""
Tests for Phase 6B: Screenshot OCR Concurrency, Queue Controller & Asynchronous Processing
"""

import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.core.ocr_queue import ocr_controller, JobStatus
from app.config import settings

client = TestClient(app)


def create_test_image_bytes(format="PNG", text="Sample"):
    img = Image.new("RGB", (200, 100), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()


def test_ocr_queue_status_endpoint():
    """Verify queue telemetry endpoint returns expected metrics."""
    response = client.get("/api/v1/screenshot/queue/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "telemetry" in data
    telemetry = data["telemetry"]
    assert "max_concurrent" in telemetry
    assert "max_queue_depth" in telemetry
    assert "active_scans" in telemetry
    assert "queued_scans" in telemetry


def test_async_screenshot_job_submission():
    """Verify submitting an image to /analyze/async returns 202 Accepted and valid job_id."""
    img_bytes = create_test_image_bytes(format="PNG")
    files = {"file": ("test_async.png", img_bytes, "image/png")}
    response = client.post("/api/v1/screenshot/analyze/async", files=files)
    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
    assert data["status"] in ["queued", "processing", "completed"]
    assert "poll_url" in data
    job_id = data["job_id"]

    # Verify job can be queried via /jobs/{job_id}
    job_resp = client.get(f"/api/v1/screenshot/jobs/{job_id}")
    assert job_resp.status_code == 200
    job_data = job_resp.json()
    assert job_data["job_id"] == job_id
    assert job_data["status"] in ["queued", "processing", "completed"]


def test_job_not_found_returns_404():
    """Verify querying an invalid job ID returns 404 Not Found."""
    response = client.get("/api/v1/screenshot/jobs/non-existent-uuid-1234")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_async_disallowed_extension_rejected():
    """Verify /analyze/async rejects disallowed file extensions."""
    files = {"file": ("malware.exe", b"fake binary data", "application/octet-stream")}
    response = client.post("/api/v1/screenshot/analyze/async", files=files)
    assert response.status_code == 400


def test_async_corrupted_magic_bytes_rejected():
    """Verify /analyze/async validates magic bytes before accepting."""
    files = {"file": ("fake.png", b"not a png magic byte stream", "image/png")}
    response = client.post("/api/v1/screenshot/analyze/async", files=files)
    assert response.status_code == 400


def test_ocr_controller_stats():
    """Verify OCR controller internal statistics report correctly."""
    stats = ocr_controller.get_stats()
    assert stats["max_concurrent"] == settings.MAX_CONCURRENT_OCR
    assert stats["max_queue_depth"] == settings.MAX_OCR_QUEUE_DEPTH
    assert isinstance(stats["active_scans"], int)
    assert isinstance(stats["queued_scans"], int)
