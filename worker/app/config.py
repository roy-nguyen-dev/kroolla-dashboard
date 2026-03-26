from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    supabase_url: str = Field(alias="SUPABASE_URL")
    supabase_service_role_key: str = Field(alias="SUPABASE_SERVICE_ROLE_KEY")
    worker_api_key: str | None = Field(default=None, alias="WORKER_API_KEY")

    worker_mode: str = Field(default="inline", alias="WORKER_MODE")
    max_concurrent_jobs: int = Field(default=1, alias="MAX_CONCURRENT_JOBS")

    whisper_model: str = Field(default="small", alias="WHISPER_MODEL")
    whisper_device: str = Field(default="cpu", alias="WHISPER_DEVICE")
    whisper_compute_type: str = Field(default="int8", alias="WHISPER_COMPUTE_TYPE")
    tmp_dir: str = Field(default=".tmp", alias="TMP_DIR")
    max_video_duration_sec: int = Field(default=10800, alias="MAX_VIDEO_DURATION_SEC")
    tiktok_cookies_file: str | None = Field(default=None, alias="TIKTOK_COOKIES_FILE")
    tiktok_cookies_from_browser: str | None = Field(
        default=None, alias="TIKTOK_COOKIES_FROM_BROWSER"
    )

    download_attempts: int = Field(default=3, alias="DOWNLOAD_ATTEMPTS")
    transcribe_attempts: int = Field(default=2, alias="TRANSCRIBE_ATTEMPTS")


settings = Settings()
