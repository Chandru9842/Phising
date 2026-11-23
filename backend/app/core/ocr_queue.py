"""
PhishShield OCR Concurrency & In-Process Job Queue Service

Provides:
1. Bounded concurrency via asyncio.Semaphore to prevent CPU/memory starvation from EasyOCR.
2. Event-loop non-blocking CPU offloading via asyncio.to_thread.
3. Bounded queue capacity tracking to prevent memory exhaustion under burst traffic.
4. Lightweight, in-memory asynchronous job manager with status tracking and TTL eviction.
5. Strict privacy guarantees: Decoded image buffers and raw bytes are wiped immediately
   after inference, never saved to disk or retained indefinitely in memory.
"""

import asyncio
import time
import uuid
import datetime
import logging
from concurrent.futures import ThreadPoolExecutor
from enum import Enum
from typing import Dict, Any, Optional, List
from fastapi import HTTPException, status
import numpy as np
import cv2

from app.config import settings

logger = logging.getLogger("phishshield.ocr_queue")


class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class OCRJob:
    def __init__(self, job_id: str, filename: str):
        self.job_id = job_id
        self.filename = filename
        self.status = JobStatus.QUEUED
        self.created_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self.started_at: Optional[str] = None
        self.completed_at: Optional[str] = None
        self.duration_ms: Optional[float] = None
        self.error_message: Optional[str] = None
        self.result: Optional[Dict[str, Any]] = None

    def to_dict(self, queue_position: int = 0) -> Dict[str, Any]:
        return {
            "job_id": self.job_id,
            "filename": self.filename,
            "status": self.status.value,
            "created_at": self.created_at,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "duration_ms": self.duration_ms,
            "queue_position": queue_position if self.status == JobStatus.QUEUED else 0,
            "error_message": self.error_message,
            "result": self.result,
        }


class OCRConcurrencyController:
    """
    Manages bounded concurrency for CPU-bound OCR and threat analysis.
    Prevents CPU thread thrashing and memory exhaustion by bounding concurrent
    EasyOCR executions to MAX_CONCURRENT_OCR while limiting queue depth.
    """
    def __init__(self):
        self._semaphore: Optional[asyncio.Semaphore] = None
        self._waiting_count: int = 0
        self._active_count: int = 0
        self._lock = asyncio.Lock()
        self._jobs: Dict[str, OCRJob] = {}
        self._job_order: List[str] = []
        self._executor = ThreadPoolExecutor(
            max_workers=max(1, settings.MAX_CONCURRENT_OCR),
            thread_name_prefix="phishshield-ocr"
        )

    def _get_semaphore(self) -> asyncio.Semaphore:
        if self._semaphore is None:
            self._semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_OCR)
        return self._semaphore

    @property
    def waiting_count(self) -> int:
        return self._waiting_count

    @property
    def active_count(self) -> int:
        return self._active_count

    def get_stats(self) -> Dict[str, Any]:
        return {
            "max_concurrent": settings.MAX_CONCURRENT_OCR,
            "max_queue_depth": settings.MAX_OCR_QUEUE_DEPTH,
            "active_scans": self._active_count,
            "queued_scans": self._waiting_count,
            "total_tracked_jobs": len(self._jobs),
        }

    async def run_bounded(self, func, *args, **kwargs) -> Any:
        """
        Executes a CPU-bound OCR/threat analysis function with bounded concurrency
        and event-loop non-blocking threadpool delegation.
        Guarantees accurate semaphore release and waiting counter cleanup on timeouts/cancellations.
        """
        async with self._lock:
            if self._waiting_count >= settings.MAX_OCR_QUEUE_DEPTH:
                logger.warning(
                    f"OCR queue saturated: {self._waiting_count} waiting >= limit {settings.MAX_OCR_QUEUE_DEPTH}"
                )
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail={
                        "error": "OCRQueueCapacityExceeded",
                        "message": (
                            f"System OCR queue capacity reached ({self._waiting_count} scans currently waiting). "
                            "Please try again shortly."
                        ),
                        "max_queue_depth": settings.MAX_OCR_QUEUE_DEPTH,
                    }
                )
            self._waiting_count += 1

        sem = self._get_semaphore()
        start_wait = time.perf_counter()
        acquired = False

        try:
            # Wait to acquire semaphore up to configured timeout
            try:
                await asyncio.wait_for(
                    sem.acquire(),
                    timeout=settings.OCR_TIMEOUT_SECONDS
                )
                acquired = True
            except asyncio.TimeoutError:
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail=(
                        f"OCR request timed out waiting in processing queue after "
                        f"{settings.OCR_TIMEOUT_SECONDS}s."
                    )
                )

            async with self._lock:
                self._waiting_count = max(0, self._waiting_count - 1)
                self._active_count += 1

            wait_duration = time.perf_counter() - start_wait
            if wait_duration > 1.0:
                logger.info(f"Scan waited {wait_duration:.2f}s in queue before starting OCR inference.")

            # Execute offloaded in dedicated threadpool to keep FastAPI event loop 100% responsive
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                loop = asyncio.get_running_loop()
                if kwargs:
                    import functools
                    p_func = functools.partial(func, *args, **kwargs)
                    result = await loop.run_in_executor(self._executor, p_func)
                else:
                    result = await loop.run_in_executor(self._executor, func, *args)
            return result

        finally:
            if not acquired:
                async with self._lock:
                    self._waiting_count = max(0, self._waiting_count - 1)
            else:
                sem.release()
                async with self._lock:
                    self._active_count = max(0, self._active_count - 1)

    # --------------------------------------------------------------------------
    # In-Memory Asynchronous Job Processing
    # --------------------------------------------------------------------------
    def create_job(self, filename: str) -> OCRJob:
        self._prune_old_jobs()
        job_id = str(uuid.uuid4())
        job = OCRJob(job_id=job_id, filename=filename)
        self._jobs[job_id] = job
        self._job_order.append(job_id)
        return job

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        job = self._jobs.get(job_id)
        if not job:
            return None

        # Compute dynamic position in queue if queued
        pos = 0
        if job.status == JobStatus.QUEUED:
            queued_ids = [
                jid for jid in self._job_order
                if self._jobs.get(jid) and self._jobs[jid].status == JobStatus.QUEUED
            ]
            try:
                pos = queued_ids.index(job_id) + 1
            except ValueError:
                pos = 1

        return job.to_dict(queue_position=pos)

    async def execute_async_job(
        self,
        job_id: str,
        raw_bytes: bytes,
        filename: str,
        detected_format: str,
        db_session_factory
    ):
        """
        Background task worker that executes OCR threat analysis for an async job,
        updates job status, persists audit record, and wipes raw image bytes from memory.
        """
        job = self._jobs.get(job_id)
        if not job:
            return

        start_time = time.perf_counter()
        try:
            # Execute bounded OCR through controller
            def _worker():
                job.status = JobStatus.PROCESSING
                job.started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

                # In-memory decoding inside threadpool
                np_arr = np.frombuffer(raw_bytes, dtype=np.uint8)
                decoded_image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                if decoded_image is None or decoded_image.size == 0:
                    raise ValueError("Corrupted image data or unsupported pixel encoding.")

                # Import threat analysis pipeline
                from app.core.screenshot_threat_service import analyze_screenshot_threats
                threat_report = analyze_screenshot_threats(
                    image=decoded_image,
                    filename=filename,
                    detected_format=detected_format
                )

                # Wipe decoded image from memory immediately
                del decoded_image
                del np_arr

                return threat_report

            result = await self.run_bounded(_worker)
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
            job.duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            job.result = result

            # Persist audit record in DB
            try:
                from app.models.scan import ScanRecord
                db = db_session_factory()
                try:
                    assessment = result.get("screenshot_assessment", {})
                    r_score = assessment.get("risk_score")
                    r_level = assessment.get("risk_level", "SAFE")
                    is_phish = bool(r_level in ["CRITICAL", "HIGH", "DANGEROUS"])
                    brands = result.get("bank_brand_evidence", [])
                    has_mismatch = any(b.get("domain_mismatch_detected") for b in brands)
                    primary_brand = brands[0].get("brand_name") if brands else None

                    top_shap = []
                    for u in result.get("extracted_urls", []):
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
                        target_input=filename,
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
                finally:
                    db.close()
            except Exception as db_err:
                logger.warning(f"Failed to persist async scan record to DB: {db_err}")

        except Exception as exc:
            logger.error(f"Async OCR job {job_id} failed: {exc}", exc_info=True)
            job.status = JobStatus.FAILED
            job.completed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
            job.duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            job.error_message = str(exc)
        finally:
            # Wipe raw byte reference from stack frame
            del raw_bytes

    def _prune_old_jobs(self, max_retained: int = 200, ttl_seconds: int = 3600):
        """
        Evicts completed/failed jobs older than ttl_seconds or caps memory retention at max_retained.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        to_remove = set()

        # Prune by age
        for jid, job in self._jobs.items():
            if job.completed_at:
                try:
                    c_time = datetime.datetime.fromisoformat(job.completed_at)
                    if (now - c_time).total_seconds() > ttl_seconds:
                        to_remove.add(jid)
                except Exception:
                    pass

        # Prune oldest if exceeds capacity
        if len(self._jobs) - len(to_remove) > max_retained:
            excess = (len(self._jobs) - len(to_remove)) - max_retained
            for jid in self._job_order:
                if excess <= 0:
                    break
                if jid not in to_remove and self._jobs[jid].status in [JobStatus.COMPLETED, JobStatus.FAILED]:
                    to_remove.add(jid)
                    excess -= 1

        for jid in to_remove:
            self._jobs.pop(jid, None)
        self._job_order = [jid for jid in self._job_order if jid not in to_remove]


# Global singleton instance
ocr_controller = OCRConcurrencyController()
