"""
PhishShield Modular EasyOCR Engine Service

Performs thread-safe, singleton-initialized optical character recognition (OCR)
on preprocessed, decoded screenshot images using EasyOCR.

SECURITY & ARCHITECTURE RULES:
- Never saves screenshots or extracted text permanently to disk.
- Never resolves, fetches, or contacts URLs found in extracted text.
- Reuses a single initialized EasyOCR reader instance across requests.
- Handles initialization and extraction failures gracefully.
"""

import os
import time
import datetime
import logging
import threading
from typing import Dict, Any, List, Optional
import numpy as np

logger = logging.getLogger("phishshield.ocr")

_reader_instance = None
_reader_lock = threading.Lock()
_reader_init_attempted = False
_reader_init_error = None


def get_ocr_reader():
    """
    Returns a thread-safe singleton instance of the EasyOCR Reader.
    Initializes on first invocation to prevent slow startup times.
    """
    global _reader_instance, _reader_init_attempted, _reader_init_error

    if _reader_instance is not None:
        return _reader_instance

    with _reader_lock:
        if _reader_instance is not None:
            return _reader_instance

        _reader_init_attempted = True
        try:
            logger.info("Initializing EasyOCR Reader (English, CPU mode)...")
            import easyocr
            from app.config import settings
            model_dir = settings.EASYOCR_MODEL_DIR or os.environ.get("EASYOCR_MODULE_PATH")
            # gpu=False ensures deterministic execution across dev and server environments
            kwargs = {"gpu": False, "verbose": False}
            if model_dir:
                kwargs["model_storage_directory"] = model_dir
                kwargs["user_network_directory"] = model_dir
            _reader_instance = easyocr.Reader(['en'], **kwargs)
            logger.info(f"EasyOCR Reader successfully initialized and cached. Model dir: {model_dir or 'default'}")
            return _reader_instance
        except Exception as exc:
            _reader_init_error = str(exc)
            logger.error(f"Failed to initialize EasyOCR engine: {exc}", exc_info=True)
            raise RuntimeError(
                f"EasyOCR engine initialization failed. Ensure torch and easyocr are installed: {exc}"
            ) from exc


def extract_text_from_image(
    image: np.ndarray,
    filename: str = "",
    detected_format: str = "PNG"
) -> Dict[str, Any]:
    """
    Executes OCR text and bounding-box extraction on a decoded OpenCV image.

    Args:
        image: Decoded numpy BGR image array (from cv2.imdecode).
        filename: Optional sanitized filename for tracking.
        detected_format: Image format string (PNG, JPEG, WEBP).

    Returns:
        Structured dictionary matching ScreenshotOCRResponse schema.
    """
    start_time = time.perf_counter()

    if image is None or not isinstance(image, np.ndarray) or image.size == 0:
        raise ValueError("Invalid image buffer passed to OCR extraction engine.")

    height, width = image.shape[:2]

    # Acquire cached reader
    reader = get_ocr_reader()

    try:
        # EasyOCR accepts numpy array (BGR or RGB) directly
        raw_results = reader.readtext(image)
    except Exception as e:
        logger.error(f"EasyOCR inference error on '{filename}': {e}", exc_info=True)
        raise RuntimeError(f"OCR inference failed during character recognition: {str(e)}") from e

    text_blocks: List[Dict[str, Any]] = []
    extracted_tokens: List[str] = []

    # Sort raw results by top-to-bottom vertical coordinate (y-min)
    # Each result is: (bbox, text, confidence)
    sorted_results = sorted(
        raw_results,
        key=lambda item: (
            min(pt[1] for pt in item[0]) if item[0] else 0,
            min(pt[0] for pt in item[0]) if item[0] else 0
        )
    )

    for bbox, text, conf in sorted_results:
        clean_text = str(text).strip() if text else ""
        if not clean_text:
            continue

        # Format bounding box as [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] in original image coordinates
        formatted_box = []
        if bbox:
            for pt in bbox:
                x = int(round(float(pt[0])))
                y = int(round(float(pt[1])))
                # Clamp coordinates to original image bounds
                x = max(0, min(width, x))
                y = max(0, min(height, y))
                formatted_box.append([x, y])

        try:
            val = float(conf) if conf is not None else 0.0
            confidence_score = round(val, 4) if np.isfinite(val) else 0.0
        except Exception:
            confidence_score = 0.0

        text_blocks.append({
            "text": clean_text,
            "confidence": confidence_score,
            "bounding_box": formatted_box
        })
        extracted_tokens.append(clean_text)

    # Full text joined with space
    full_text = " ".join(extracted_tokens)
    processing_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return {
        "success": True,
        "filename": filename or "screenshot.png",
        "processing_status": "ocr_completed",
        "ocr_engine": "EasyOCR",
        "language": "en",
        "extracted_text": full_text,
        "text_blocks": text_blocks,
        "text_block_count": len(text_blocks),
        "processing_time_ms": processing_time_ms,
        "detected_format": detected_format,
        "image_width": width,
        "image_height": height,
        "analyzed_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
