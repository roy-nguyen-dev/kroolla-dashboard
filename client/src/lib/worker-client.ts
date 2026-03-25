const WORKER_API_URL = process.env.WORKER_API_URL;
const WORKER_API_KEY = process.env.WORKER_API_KEY;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function triggerWorkerJob(input: {
  jobId: string;
  videoUrl: string;
  sourceType: string;
}) {
  if (!WORKER_API_URL) {
    throw new Error("Missing WORKER_API_URL.");
  }

  let attempt = 0;
  let lastError: unknown;

  while (attempt < 3) {
    try {
      const response = await fetch(`${WORKER_API_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(WORKER_API_KEY ? { Authorization: `Bearer ${WORKER_API_KEY}` } : {}),
        },
        body: JSON.stringify({
          job_id: input.jobId,
          video_url: input.videoUrl,
          source_type: input.sourceType,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Worker trigger failed (${response.status}): ${body}`);
      }

      return;
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt < 3) {
        await sleep(attempt * 600);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Worker trigger failed after retries.");
}

