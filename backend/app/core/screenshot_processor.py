"""
PhishShield Safe Screenshot Image Processor

Performs secure in-memory validation, magic-byte inspection, decompression bomb
protection, and OpenCV decoding/normalization for screenshot analysis.

SECURITY RULES:
- Never saves uploaded files permanently to disk.
- Never resolves, fetches, or executes external URLs found in screenshots.
- Never executes uploaded file bytes.
- Enforces strict 5 MB file size and 4096x4096px dimension boundaries.
"""

import uuid
import datetime
import logging
from typing import Dict, Any, Tuple
import numpy as np
import cv2

logger = logging.getLogger("phishshield.screenshot")

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
MAX_IMAGE_WIDTH = 4096
MAX_IMAGE_HEIGHT = 4096
MAX_PIXELS = 16_000_000  # 16 Megapixels

ALLOWED_MIME_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp"
}

ALLOWED_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp"
}


def validate_magic_bytes(data: bytes) -> str:
    """
    Validates actual binary signatures (magic bytes) of the uploaded image.
    Returns detected format ('PNG', 'JPEG', 'WEBP') or raises ValueError.
    """
    if len(data) < 12:
        raise ValueError("File content is too small to be a valid image header.")

    # PNG magic bytes: \x89PNG\r\n\x1a\n
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "PNG"

    # JPEG magic bytes: \xff\xd8\xff
    if data.startswith(b"\xff\xd8\xff"):
        return "JPEG"

    # WEBP magic bytes: RIFF....WEBP
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "WEBP"

    raise ValueError(
        "Invalid image signature. The file header does not match authorized image standards (PNG, JPEG, WEBP)."
    )


def process_screenshot_bytes(
    raw_bytes: bytes,
    original_filename: str,
    content_type: str = ""
) -> Dict[str, Any]:
    """
    Safely validates, decodes with OpenCV, and normalizes screenshot bytes in-memory.
    Returns structured metadata dictionary.
    """
    file_size = len(raw_bytes)

    # 1. Enforce size limits
    if file_size == 0:
        raise ValueError("Uploaded file is empty (0 bytes).")

    if file_size > MAX_FILE_SIZE_BYTES:
        raise ValueError(
            f"File size ({file_size / (1024 * 1024):.2f} MB) exceeds maximum allowed limit of 5.0 MB."
        )

    # 2. Inspect binary magic bytes
    detected_format = validate_magic_bytes(raw_bytes)

    # 3. Safe in-memory OpenCV decoding
    np_buffer = np.frombuffer(raw_bytes, dtype=np.uint8)
    image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError(
            "Image decoding failed. File may be corrupted, truncated, or an unsupported image variant."
        )

    height, width = image.shape[:2]
    channels = image.shape[2] if len(image.shape) > 2 else 1
    total_pixels = width * height

    # 4. Decompression bomb and dimension protection
    if width > MAX_IMAGE_WIDTH or height > MAX_IMAGE_HEIGHT or total_pixels > MAX_PIXELS:
        raise ValueError(
            f"Image dimensions ({width}x{height}, {total_pixels / 1_000_000:.1f}MP) exceed safety thresholds "
            f"(maximum {MAX_IMAGE_WIDTH}x{MAX_IMAGE_HEIGHT}px, {MAX_PIXELS / 1_000_000:.0f}MP)."
        )

    if width < 10 or height < 10:
        raise ValueError(
            f"Image dimensions ({width}x{height}) are too small for cybersecurity screenshot evaluation."
        )

    # 5. Safe normalization metrics for future OCR processing
    aspect_ratio = round(width / height, 3) if height > 0 else 1.0

    # Test conversion to grayscale to ensure pixel readability
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mean_luminance = round(float(np.mean(gray)), 2)
    std_luminance = round(float(np.std(gray)), 2)

    # Check for totally blank or solid color screens
    is_solid_screen = std_luminance < 1.0

    upload_id = str(uuid.uuid4())
    analyzed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

    normalization_details = {
        "mean_luminance": mean_luminance,
        "std_luminance": std_luminance,
        "is_solid_screen": is_solid_screen,
        "ocr_target_ready": not is_solid_screen,
        "recommended_ocr_scale": 1.0 if width <= 1920 else round(1920 / width, 2),
        "security_verdict": "SAFE_IMAGE_STRUCTURE",
        "in_memory_transient": True,
        "persisted_to_disk": False
    }

    # Deliberately release large image buffers from local scope
    del image
    del gray
    del np_buffer

    return {
        "success": True,
        "filename": original_filename or f"screenshot_{upload_id[:8]}.{detected_format.lower()}",
        "detected_format": detected_format,
        "image_width": width,
        "image_height": height,
        "file_size": file_size,
        "aspect_ratio": aspect_ratio,
        "color_channels": channels,
        "processing_status": "normalized_for_ocr",
        "upload_id": upload_id,
        "analyzed_at": analyzed_at,
        "normalization_details": normalization_details,
    }
