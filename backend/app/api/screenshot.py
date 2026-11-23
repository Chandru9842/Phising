"""
FastAPI Router for PhishShield Screenshot Upload & Safe Processing
"""

import os
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends, BackgroundTasks
from sqlalchemy.orm import Session
import numpy as np
import cv2
import logging
from app.database import get_db, SessionLocal
from app.models.scan import ScanRecord
from app.schemas.screenshot import (
    ScreenshotUploadResponse,
    ScreenshotOCRResponse,
    ScreenshotThreatAnalysisResponse
)
from app.core.ocr_engine import extract_text_from_image
from app.core.screenshot_threat_service import analyze_screenshot_threats
from app.core.ocr_queue import ocr_controller, JobStatus
from app.core.screenshot_processor import (
    process_screenshot_bytes,
    validate_magic_bytes,
    ALLOWED_EXTENSIONS,
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE_BYTES,
    MAX_IMAGE_WIDTH,
    MAX_IMAGE_HEIGHT,
    MAX_PIXELS
)

logger = logging.getLogger("phishshield.api.screenshot")

router = APIRouter(prefix="/screenshot", tags=["Screenshot Processing"])


@router.post(
    "/upload",
    response_model=ScreenshotUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload & Safely Process Screenshot for Phishing Analysis"
)
async def upload_screenshot(
    file: UploadFile = File(..., description="Screenshot image file (PNG, JPEG, WEBP, max 5MB)")
):
    """
    Accepts screenshot image files (PNG, JPEG/JPG, WEBP) up to 5MB.
    Safely validates file signature (magic bytes), dimensions, decompression bomb risks,
    and performs in-memory OpenCV normalization without permanent disk storage.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload payload."
        )

    # 1. Check file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Only PNG, JPEG/JPG, and WEBP are accepted."
        )

    # 2. Check client declared content-type if provided
    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported MIME type '{file.content_type}'. Must be image/png, image/jpeg, or image/webp."
        )

    # 3. Read bytes with streaming chunk protection
    try:
        contents = bytearray()
        chunk_size = 64 * 1024  # 64 KB
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            contents.extend(chunk)
            if len(contents) > MAX_FILE_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum upload limit of 5.0 MB ({MAX_FILE_SIZE_BYTES} bytes)."
                )

        raw_bytes = bytes(contents)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error reading uploaded file: {str(e)}"
        )
    finally:
        await file.close()

    # 4. Safe in-memory decoding and normalization
    try:
        metadata = process_screenshot_bytes(
            raw_bytes=raw_bytes,
            original_filename=file.filename,
            content_type=file.content_type or ""
        )
        return ScreenshotUploadResponse(**metadata)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image processing failed: {str(e)}"
        )


@router.post(
    "/ocr",
    response_model=ScreenshotOCRResponse,
    status_code=status.HTTP_200_OK,
    summary="Extract Text from Banking Screenshot via EasyOCR"
)
async def ocr_screenshot(
    file: UploadFile = File(..., description="Screenshot image file (PNG, JPEG, WEBP, max 5MB)")
):
    """
    Accepts screenshot image files (PNG, JPEG/JPG, WEBP) up to 5MB.
    Safely validates file signature (magic bytes), dimensions, decompression bomb risks,
    and extracts visible text and bounding boxes using EasyOCR without disk persistence.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload payload."
        )

    # 1. Check file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Only PNG, JPEG/JPG, and WEBP are accepted."
        )

    # 2. Check client declared content-type if provided
    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported MIME type '{file.content_type}'. Must be image/png, image/jpeg, or image/webp."
        )

    # 3. Read bytes with streaming chunk protection
    try:
        contents = bytearray()
        chunk_size = 64 * 1024  # 64 KB
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            contents.extend(chunk)
            if len(contents) > MAX_FILE_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum upload limit of 5.0 MB ({MAX_FILE_SIZE_BYTES} bytes)."
                )

        raw_bytes = bytes(contents)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error reading uploaded file: {str(e)}"
        )
    finally:
        await file.close()

    # 4. Validate magic bytes and decode image in-memory
    try:
        detected_format = validate_magic_bytes(raw_bytes)
        np_arr = np.frombuffer(raw_bytes, dtype=np.uint8)
        decoded_image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if decoded_image is None or decoded_image.size == 0:
            raise ValueError("Corrupted image data or unsupported pixel encoding.")

        h, w = decoded_image.shape[:2]
        if w > MAX_IMAGE_WIDTH or h > MAX_IMAGE_HEIGHT:
            raise ValueError(
                f"Image dimensions {w}x{h} exceed maximum allowable limits ({MAX_IMAGE_WIDTH}x{MAX_IMAGE_HEIGHT} px)."
            )

        if (w * h) > MAX_PIXELS:
            raise ValueError(
                f"Image pixel count ({w*h:,}) exceeds maximum safety limit ({MAX_PIXELS:,} pixels)."
            )

        # 5. Modular OCR extraction via EasyOCR
        ocr_result = extract_text_from_image(
            image=decoded_image,
            filename=file.filename,
            detected_format=detected_format
        )
        return ScreenshotOCRResponse(**ocr_result)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(re)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR processing failed: {str(e)}"
        )


@router.post(
    "/analyze",
    response_model=ScreenshotThreatAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Comprehensive Screenshot Phishing Threat Intelligence Analysis"
)
async def analyze_screenshot_endpoint(
    file: UploadFile = File(..., description="Screenshot image file (PNG, JPEG, WEBP, max 5MB)"),
    db: Session = Depends(get_db)
):
    """
    Executes the complete Phase 5C Screenshot Threat Intelligence Pipeline:
    1. Validates magic bytes, file format, and decompression bomb safety thresholds.
    2. Runs EasyOCR to extract typography, text blocks, and coordinates in-memory.
    3. Normalizes and extracts URL candidates without outbound network resolution.
    4. Evaluates extracted URLs using Random Forest, SHAP explainability, and brand engines.
    5. Detects Indian banking brand names in text and flags domain mismatches.
    6. Identifies social engineering coercion, OTP interception, and credential harvesting signals.
    7. Synthesizes a calibrated, explainable multi-factor risk assessment.
    8. Records audit entry to database.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload payload."
        )

    # 1. Check file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Only PNG, JPEG/JPG, and WEBP are accepted."
        )

    # 2. Check client declared content-type if provided
    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported MIME type '{file.content_type}'. Must be image/png, image/jpeg, or image/webp."
        )

    # 3. Read bytes with streaming chunk protection
    try:
        contents = bytearray()
        chunk_size = 64 * 1024  # 64 KB
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            contents.extend(chunk)
            if len(contents) > MAX_FILE_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum upload limit of 5.0 MB ({MAX_FILE_SIZE_BYTES} bytes)."
                )

        raw_bytes = bytes(contents)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error reading uploaded file: {str(e)}"
        )
    finally:
        await file.close()

    # 4. In-memory validation and decoding
    try:
        detected_format = validate_magic_bytes(raw_bytes)
        np_arr = np.frombuffer(raw_bytes, dtype=np.uint8)
        decoded_image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if decoded_image is None or decoded_image.size == 0:
            raise ValueError("Corrupted image data or unsupported pixel encoding.")

        h, w = decoded_image.shape[:2]
        if w > MAX_IMAGE_WIDTH or h > MAX_IMAGE_HEIGHT:
            raise ValueError(
                f"Image dimensions {w}x{h} exceed maximum allowable limits ({MAX_IMAGE_WIDTH}x{MAX_IMAGE_HEIGHT} px)."
            )

        if (w * h) > MAX_PIXELS:
            raise ValueError(
                f"Image pixel count ({w*h:,}) exceeds maximum safety limit ({MAX_PIXELS:,} pixels)."
            )

        # 5. Full Threat Intelligence Pipeline Execution (Bounded Concurrency & Threadpool Delegation)
        def _sync_worker(img):
            return analyze_screenshot_threats(
                image=img,
                filename=file.filename,
                detected_format=detected_format
            )

        try:
            threat_report = await ocr_controller.run_bounded(_sync_worker, decoded_image)
        finally:
            del decoded_image

        # 6. Persist audit record to SQLite database
        try:
            assessment = threat_report.get("screenshot_assessment", {})
            r_score = assessment.get("risk_score")
            r_level = assessment.get("risk_level", "SAFE")
            is_phish = bool(r_level in ["CRITICAL", "HIGH", "DANGEROUS"])
            
            brands = threat_report.get("bank_brand_evidence", [])
            has_mismatch = any(b.get("domain_mismatch_detected") for b in brands)
            primary_brand = brands[0].get("brand_name") if brands else None

            # Get top SHAP contributors from highest risk URL candidate if available
            top_shap = []
            for u in threat_report.get("extracted_urls", []):
                u_res = u.get("url_scan_result") or {}
                s_exp = u_res.get("shap_explanation") or {}
                if s_exp.get("top_positive_contributors"):
                    top_shap = [
                        {"name": c.get("feature_name"), "shap": c.get("shap_value"), "dir": c.get("direction")}
                        for c in s_exp.get("top_positive_contributors", [])[:3]
                    ]
                    break

            record = ScanRecord(
                scan_type="screenshot",
                target_input=file.filename,
                risk_score=float(r_score) if r_score is not None else None,
                risk_level=r_level,
                is_phishing=is_phish,
                is_brand_impersonation=has_mismatch,
                target_brand=primary_brand,
                impersonation_technique="screenshot_brand_mismatch" if has_mismatch else None,
                reasons=assessment.get("reasons", []),
                shap_features=top_shap
            )
            db.add(record)
            db.commit()
        except Exception as db_err:
            logger.warning(f"Failed to persist screenshot scan record to database: {db_err}")
            db.rollback()

        return ScreenshotThreatAnalysisResponse(**threat_report)

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(re)
        )
    except Exception as e:
        logger.error(f"Screenshot threat analysis failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Threat intelligence analysis failed: {str(e)}"
        )


@router.get(
    "/queue/status",
    summary="OCR Processing Queue & Concurrency Telemetry"
)
async def get_ocr_queue_status():
    """
    Returns live concurrency, queue depth, and active scan telemetry for OCR processing.
    """
    return {
        "status": "healthy",
        "telemetry": ocr_controller.get_stats()
    }


@router.post(
    "/analyze/async",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Asynchronous Screenshot Phishing Threat Intelligence Analysis"
)
async def analyze_screenshot_async_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Screenshot image file (PNG, JPEG, WEBP, max 5MB)")
):
    """
    Asynchronous job endpoint:
    1. Validates upload signature and format in memory.
    2. Registers in-process background job with unique job_id.
    3. Queues background worker with bounded concurrency (MAX_CONCURRENT_OCR).
    4. Immediately returns HTTP 202 Accepted with tracking metadata.
    5. Zero permanent disk storage; decoded buffer wiped immediately after inference.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload payload."
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Only PNG, JPEG/JPG, and WEBP are accepted."
        )

    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported MIME type '{file.content_type}'. Must be image/png, image/jpeg, or image/webp."
        )

    try:
        contents = bytearray()
        chunk_size = 64 * 1024
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            contents.extend(chunk)
            if len(contents) > MAX_FILE_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum upload limit of 5.0 MB ({MAX_FILE_SIZE_BYTES} bytes)."
                )
        raw_bytes = bytes(contents)
    finally:
        await file.close()

    try:
        detected_format = validate_magic_bytes(raw_bytes)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

    # Create job tracking record
    job = ocr_controller.create_job(filename=file.filename)

    # Dispatch to background task
    background_tasks.add_task(
        ocr_controller.execute_async_job,
        job_id=job.job_id,
        raw_bytes=raw_bytes,
        filename=file.filename,
        detected_format=detected_format,
        db_session_factory=SessionLocal
    )

    return {
        "job_id": job.job_id,
        "filename": job.filename,
        "status": job.status.value,
        "created_at": job.created_at,
        "poll_url": f"/api/v1/screenshot/jobs/{job.job_id}",
        "message": "Screenshot analysis job accepted and queued for execution."
    }


@router.get(
    "/jobs/{job_id}",
    summary="Retrieve Asynchronous Screenshot Scan Job Status & Threat Dossier"
)
async def get_screenshot_job_status(job_id: str):
    """
    Retrieves status, progress, timestamps, and completed results for an async scan job.
    """
    job_info = ocr_controller.get_job(job_id)
    if not job_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan job with ID '{job_id}' not found or expired from cache."
        )
    return job_info
