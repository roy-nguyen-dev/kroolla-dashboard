import type { JobRow } from "@/lib/types";

export function mapJobStatusResponse(job: JobRow) {
  return {
    jobId: job.id,
    status: job.status,
    provider: job.provider,
    modelName: job.model_name,
    language: job.language,
    errorMessage: job.error_message,
    startedAt: job.started_at,
    finishedAt: job.finished_at,
    createdAt: job.created_at,
  };
}

