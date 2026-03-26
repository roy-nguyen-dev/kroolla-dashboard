export type SourceType = "youtube" | "vimeo" | "direct_file" | "other";

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export type VideoRow = {
  id: string;
  source_url: string;
  source_type: SourceType;
  external_id: string | null;
  title: string | null;
  duration_sec: number | null;
  created_at: string;
};

export type JobRow = {
  id: string;
  video_id: string;
  status: JobStatus;
  provider: string;
  model_name: string;
  language: string | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
};

export type SegmentRow = {
  id: number;
  job_id: string;
  segment_index: number;
  start_ms: number;
  end_ms: number;
  speaker: string | null;
  text: string;
  confidence: number | null;
  created_at: string;
};

export type TranscriptDocumentRow = {
  job_id: string;
  full_text: string;
  summary: string | null;
  updated_at: string;
};

export type JobListItem = {
  jobId: string;
  status: JobStatus;
  provider: string;
  modelName: string;
  language: string | null;
  errorMessage: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  videoUrl: string;
  sourceType: SourceType;
  videoTitle: string | null;
  durationSec: number | null;
  summary: string | null;
};

