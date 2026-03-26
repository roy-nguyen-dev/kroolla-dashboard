from pydantic import BaseModel, Field, HttpUrl


class JobRequest(BaseModel):
    job_id: str = Field(min_length=1)
    video_url: HttpUrl
    source_type: str


class SegmentPayload(BaseModel):
    job_id: str
    segment_index: int
    start_ms: int
    end_ms: int
    speaker: str | None
    text: str
    confidence: float | None
