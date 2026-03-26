# Kroolla Worker

Python worker service for media transcription. It receives jobs from the client app, runs Whisper transcription, and writes outputs to Supabase.

## Prerequisites

- Python 3.11+
- `ffmpeg` available in PATH

## Setup

```bash
cd worker
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Fill in `.env`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WORKER_API_KEY` (optional but recommended)
- `WORKER_MODE` (`inline` for immediate mode, `queue` for background mode)
- `TIKTOK_COOKIES_FILE` (optional path to Netscape cookie file)
- `TIKTOK_COOKIES_FROM_BROWSER` (optional browser source, e.g. `chrome` or `edge`)

## Run

```bash
uvicorn app.main:app --reload --port 8001
```

Health check:

```bash
curl http://localhost:8001/health
```

## API Contract

`POST /jobs`

Request JSON:

```json
{
  "job_id": "<uuid>",
  "video_url": "https://www.youtube.com/watch?v=...",
  "source_type": "youtube"
}
```

Headers:

- `Authorization: Bearer <WORKER_API_KEY>` (required only if `WORKER_API_KEY` is configured)

## Modes

- `inline`: process immediately inside the request
- `queue`: enqueue request and process in background workers

## TikTok Restricted Posts

Some TikTok videos require authenticated cookies. Configure one of:

- `TIKTOK_COOKIES_FILE=/path/to/cookies.txt`
- `TIKTOK_COOKIES_FROM_BROWSER=chrome`

If both are set, cookie file takes priority.

## Local Integration with Client

In `client/.env.local`:

```env
WORKER_API_URL=http://localhost:8001
WORKER_API_KEY=<same_as_worker_api_key>
```
