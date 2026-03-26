from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote

import httpx

from app.config import settings

_UNSET = object()


class SupabaseClient:
    def __init__(self) -> None:
        self._base_url = f"{settings.supabase_url.rstrip('/')}/rest/v1"
        self._headers = {
            "apikey": settings.supabase_service_role_key,
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "Content-Type": "application/json",
        }

    def _url(self, path: str) -> str:
        return f"{self._base_url}/{path.lstrip('/')}"

    def _request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        headers = {**self._headers, **kwargs.pop("headers", {})}
        response = httpx.request(
            method,
            self._url(path),
            headers=headers,
            timeout=30.0,
            **kwargs,
        )
        if response.status_code >= 400:
            raise RuntimeError(
                f"Supabase request failed ({response.status_code}): {response.text}"
            )
        return response

    def get_job(self, job_id: str) -> dict[str, Any] | None:
        quoted_id = quote(job_id, safe="")
        response = self._request(
            "GET",
            f"transcription_jobs?select=*&id=eq.{quoted_id}&limit=1",
        )
        rows = response.json()
        return rows[0] if rows else None

    def update_job_status(
        self,
        job_id: str,
        *,
        status: str,
        error_message: str | None = None,
        started_at: str | None | object = _UNSET,
        finished_at: str | None | object = _UNSET,
    ) -> None:
        quoted_id = quote(job_id, safe="")
        payload: dict[str, Any] = {"status": status, "error_message": error_message}
        if started_at is not _UNSET:
            payload["started_at"] = started_at
        if finished_at is not _UNSET:
            payload["finished_at"] = finished_at
        self._request(
            "PATCH",
            f"transcription_jobs?id=eq.{quoted_id}",
            json=payload,
        )

    def replace_segments(self, job_id: str, segments: list[dict[str, Any]]) -> None:
        quoted_id = quote(job_id, safe="")
        self._request("DELETE", f"transcript_segments?job_id=eq.{quoted_id}")
        if not segments:
            return
        self._request(
            "POST",
            "transcript_segments",
            headers={"Prefer": "return=minimal"},
            json=segments,
        )

    def upsert_document(self, job_id: str, full_text: str, summary: str | None) -> None:
        self._request(
            "POST",
            "transcript_documents?on_conflict=job_id",
            headers={"Prefer": "resolution=merge-duplicates,return=minimal"},
            json=[
                {
                    "job_id": job_id,
                    "full_text": full_text,
                    "summary": summary,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            ],
        )
