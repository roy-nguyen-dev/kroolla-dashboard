from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from fastapi import FastAPI, Header, HTTPException, status

from app.config import settings
from app.models import JobRequest
from app.queue import WorkerQueue
from app.supabase_client import SupabaseClient
from app.transcription import transcribe_video
from app.validators import ALLOWED_SOURCE_TYPES, is_allowed_video_url


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

app = FastAPI(title="Kroolla Worker", version="0.1.0")
logger = logging.getLogger("worker.api")
supabase = SupabaseClient()
queue = WorkerQueue(
    processor=lambda payload: process_job(payload),
    concurrency=settings.max_concurrent_jobs,
)


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def _assert_api_key(auth_header: str | None) -> None:
    if not settings.worker_api_key:
        return
    expected = f"Bearer {settings.worker_api_key}"
    if auth_header != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
        )


async def _run_in_thread(func, *args, **kwargs):
    return await asyncio.to_thread(func, *args, **kwargs)


async def _run_with_retry(func, *args, attempts: int, op_name: str):
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            return await _run_in_thread(func, *args)
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt < attempts:
                await asyncio.sleep(attempt * 0.7)
    if last_error is None:
        raise RuntimeError(f"{op_name} failed with unknown error.")
    raise RuntimeError(f"{op_name} failed after {attempts} attempts: {last_error}")


async def process_job(payload: dict) -> None:
    job_id = payload["job_id"]
    video_url = payload["video_url"]

    logger.info("job_started", extra={"job_id": job_id})
    job = await _run_in_thread(supabase.get_job, job_id)
    if not job:
        raise RuntimeError("Job does not exist in Supabase.")
    if job["status"] in {"processing", "completed"}:
        logger.info(
            "job_skipped_existing_status",
            extra={"job_id": job_id, "status": job["status"]},
        )
        return

    await _run_in_thread(
        supabase.update_job_status,
        job_id,
        status="processing",
        error_message=None,
        started_at=_utcnow(),
        finished_at=None,
    )

    try:
        segments, full_text, summary = await _run_with_retry(
            transcribe_video,
            video_url,
            attempts=max(settings.download_attempts, settings.transcribe_attempts),
            op_name="transcription",
        )

        segment_rows = [
            {
                "job_id": job_id,
                "segment_index": row["segment_index"],
                "start_ms": row["start_ms"],
                "end_ms": row["end_ms"],
                "speaker": row["speaker"],
                "text": row["text"],
                "confidence": row["confidence"],
            }
            for row in segments
        ]

        await _run_in_thread(supabase.replace_segments, job_id, segment_rows)
        await _run_in_thread(supabase.upsert_document, job_id, full_text, summary)
        await _run_in_thread(
            supabase.update_job_status,
            job_id,
            status="completed",
            error_message=None,
            finished_at=_utcnow(),
        )
        logger.info("job_completed", extra={"job_id": job_id})
    except Exception as exc:  # noqa: BLE001
        await _run_in_thread(
            supabase.update_job_status,
            job_id,
            status="failed",
            error_message=str(exc)[:2000],
            finished_at=_utcnow(),
        )
        logger.exception("job_failed", extra={"job_id": job_id})
        raise


@app.on_event("startup")
async def on_startup() -> None:
    if settings.worker_mode == "queue":
        await queue.start()
        logger.info("queue_started", extra={"concurrency": settings.max_concurrent_jobs})


@app.on_event("shutdown")
async def on_shutdown() -> None:
    if settings.worker_mode == "queue":
        await queue.stop()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "mode": settings.worker_mode}


@app.post("/jobs")
async def create_job(
    payload: JobRequest,
    authorization: str | None = Header(default=None),
) -> dict[str, str]:
    _assert_api_key(authorization)
    if payload.source_type not in ALLOWED_SOURCE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported source_type.",
        )
    if not is_allowed_video_url(str(payload.video_url)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported video URL host.",
        )

    request_data = {
        "job_id": payload.job_id,
        "video_url": str(payload.video_url),
        "source_type": payload.source_type,
    }

    if settings.worker_mode == "queue":
        await queue.enqueue(request_data)
        return {"accepted": "true", "mode": "queue"}

    await process_job(request_data)
    return {"accepted": "true", "mode": "inline"}
