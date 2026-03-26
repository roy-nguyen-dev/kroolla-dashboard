from __future__ import annotations

import shutil
import tempfile
from pathlib import Path
from typing import Any

from faster_whisper import WhisperModel
from yt_dlp import YoutubeDL

from app.config import settings


_model: WhisperModel | None = None


def _get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(
            settings.whisper_model,
            device=settings.whisper_device,
            compute_type=settings.whisper_compute_type,
        )
    return _model


def _download_audio(video_url: str, output_dir: Path) -> Path:
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": str(output_dir / "%(id)s.%(ext)s"),
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "extractaudio": True,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
    }
    if settings.tiktok_cookies_file:
        ydl_opts["cookiefile"] = settings.tiktok_cookies_file
    elif settings.tiktok_cookies_from_browser:
        browser_parts = [
            part.strip()
            for part in settings.tiktok_cookies_from_browser.split(":")
            if part.strip()
        ]
        if browser_parts:
            if len(browser_parts) == 1:
                ydl_opts["cookiesfrombrowser"] = (browser_parts[0],)
            else:
                ydl_opts["cookiesfrombrowser"] = tuple(browser_parts)

    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=True)
        duration = int(info.get("duration") or 0)
        if duration > settings.max_video_duration_sec:
            raise RuntimeError(
                f"Video duration exceeds allowed max: {duration}s > {settings.max_video_duration_sec}s"
            )
        downloaded_path = Path(ydl.prepare_filename(info)).with_suffix(".mp3")

    if not downloaded_path.exists():
        raise RuntimeError("Audio download completed but output file not found.")
    return downloaded_path


def _summarize(full_text: str) -> str | None:
    clean = full_text.strip()
    if not clean:
        return None
    sentences = [part.strip() for part in clean.split(".") if part.strip()]
    if not sentences:
        return clean[:280]
    return ". ".join(sentences[:2])[:600]


def transcribe_video(video_url: str) -> tuple[list[dict[str, Any]], str, str | None]:
    base_tmp = Path(settings.tmp_dir)
    base_tmp.mkdir(parents=True, exist_ok=True)
    temp_dir = Path(tempfile.mkdtemp(prefix="worker-", dir=str(base_tmp)))
    try:
        audio_path = _download_audio(video_url, temp_dir)
        model = _get_model()

        segments, info = model.transcribe(
            str(audio_path),
            vad_filter=True,
            word_timestamps=False,
        )

        rows: list[dict[str, Any]] = []
        full_parts: list[str] = []
        for index, segment in enumerate(segments):
            text = (segment.text or "").strip()
            if not text:
                continue
            full_parts.append(text)
            rows.append(
                {
                    "segment_index": index,
                    "start_ms": max(0, int(segment.start * 1000)),
                    "end_ms": max(0, int(segment.end * 1000)),
                    "speaker": None,
                    "text": text,
                    "confidence": None,
                }
            )

        full_text = " ".join(full_parts).strip()
        summary = _summarize(full_text)
        _ = info
        return rows, full_text, summary
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
