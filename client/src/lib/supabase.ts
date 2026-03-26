import type {
  JobListItem,
  JobRow,
  SegmentRow,
  SourceType,
  TranscriptDocumentRow,
  VideoRow,
} from "@/lib/types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getBaseHeaders() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };
}

async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...getBaseHeaders(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${message}`);
  }

  if (response.status === 204) {
    return [] as T;
  }

  return (await response.json()) as T;
}

export async function findVideoByUrl(sourceUrl: string): Promise<VideoRow | null> {
  const query = new URLSearchParams({
    select: "*",
    source_url: `eq.${sourceUrl}`,
    limit: "1",
  });
  const rows = await supabaseFetch<VideoRow[]>(`videos?${query.toString()}`);
  return rows[0] ?? null;
}

export async function createVideo(input: {
  source_url: string;
  source_type: SourceType;
}): Promise<VideoRow> {
  const rows = await supabaseFetch<VideoRow[]>("videos", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify([input]),
  });
  return rows[0];
}

export async function createJob(input: {
  video_id: string;
  provider?: string;
  model_name?: string;
  language?: string | null;
}): Promise<JobRow> {
  const rows = await supabaseFetch<JobRow[]>("transcription_jobs", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify([
      {
        video_id: input.video_id,
        provider: input.provider ?? "faster-whisper",
        model_name: input.model_name ?? "small",
        language: input.language ?? null,
      },
    ]),
  });
  return rows[0];
}

export async function findLatestActiveJobByVideo(
  videoId: string,
): Promise<JobRow | null> {
  const query = new URLSearchParams({
    select: "*",
    video_id: `eq.${videoId}`,
    status: "in.(queued,processing)",
    order: "created_at.desc",
    limit: "1",
  });
  const rows = await supabaseFetch<JobRow[]>(
    `transcription_jobs?${query.toString()}`,
  );
  return rows[0] ?? null;
}

export async function getJobById(jobId: string): Promise<JobRow | null> {
  const query = new URLSearchParams({
    select: "*",
    id: `eq.${jobId}`,
    limit: "1",
  });
  const rows = await supabaseFetch<JobRow[]>(
    `transcription_jobs?${query.toString()}`,
  );
  return rows[0] ?? null;
}

export async function markJobFailed(
  jobId: string,
  errorMessage: string,
): Promise<void> {
  const query = new URLSearchParams({
    id: `eq.${jobId}`,
  });

  await supabaseFetch<unknown>(`transcription_jobs?${query.toString()}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "failed",
      error_message: errorMessage,
      finished_at: new Date().toISOString(),
    }),
  });
}

type JobListRawRow = JobRow & {
  videos:
    | {
        source_url: string;
        source_type: SourceType;
        title: string | null;
        duration_sec: number | null;
      }
    | null;
  transcript_documents:
    | Array<{
        summary: string | null;
        updated_at: string;
      }>
    | null;
};

export async function listRecentJobs(limit = 50): Promise<JobListItem[]> {
  const query = new URLSearchParams({
    select:
      "id,status,provider,model_name,language,error_message,created_at,started_at,finished_at,videos:videos!transcription_jobs_video_id_fkey(source_url,source_type,title,duration_sec),transcript_documents(summary,updated_at)",
    order: "created_at.desc",
    limit: String(limit),
  });

  const rows = await supabaseFetch<JobListRawRow[]>(
    `transcription_jobs?${query.toString()}`,
  );

  return rows.map((row) => ({
    jobId: row.id,
    status: row.status,
    provider: row.provider,
    modelName: row.model_name,
    language: row.language,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    videoUrl: row.videos?.source_url ?? "",
    sourceType: row.videos?.source_type ?? "other",
    videoTitle: row.videos?.title ?? null,
    durationSec: row.videos?.duration_sec ?? null,
    summary: row.transcript_documents?.[0]?.summary ?? null,
  }));
}

export async function getSegmentsByJobId(jobId: string): Promise<SegmentRow[]> {
  const query = new URLSearchParams({
    select: "*",
    job_id: `eq.${jobId}`,
    order: "segment_index.asc",
  });
  return supabaseFetch<SegmentRow[]>(`transcript_segments?${query.toString()}`);
}

export async function getTranscriptDocumentByJobId(
  jobId: string,
): Promise<TranscriptDocumentRow | null> {
  const query = new URLSearchParams({
    select: "*",
    job_id: `eq.${jobId}`,
    limit: "1",
  });
  const rows = await supabaseFetch<TranscriptDocumentRow[]>(
    `transcript_documents?${query.toString()}`,
  );
  return rows[0] ?? null;
}

