"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type JobStatusPayload = {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  provider: string;
  modelName: string;
  language: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
};

export function JobStatus({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobStatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isTerminal = job?.status === "completed" || job?.status === "failed";

  useEffect(() => {
    if (isTerminal) {
      return;
    }

    let interval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    async function run() {
      try {
        const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
        const data = (await response.json()) as JobStatusPayload & { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to fetch job.");
        }

        if (!cancelled) {
          setJob(data);
          if (data.status === "completed" || data.status === "failed") {
            if (interval) clearInterval(interval);
          }
        }
      } catch (statusError) {
        if (!cancelled) {
          setError(
            statusError instanceof Error
              ? statusError.message
              : "Unable to load job status.",
          );
        }
      }
    }

    run();
    interval = setInterval(run, 4000);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [isTerminal, jobId]);

  const badgeClass = useMemo(() => {
    const status = job?.status;
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "failed") return "bg-red-100 text-red-700";
    if (status === "processing") return "bg-blue-100 text-blue-700";
    return "bg-zinc-200 text-zinc-700";
  }, [job?.status]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!job) {
    return <p className="text-sm text-zinc-600">Loading job status...</p>;
  }

  return (
    <div className="rounded-md border border-zinc-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Job: {job.jobId}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
          {job.status}
        </span>
      </div>
      <p className="text-sm text-zinc-600">
        Provider: {job.provider} - Model: {job.modelName}
      </p>
      {job.errorMessage ? (
        <p className="mt-2 text-sm text-red-600">{job.errorMessage}</p>
      ) : null}
      <div className="mt-4 flex gap-3">
        <Link href="/submit" className="text-sm underline">
          Submit another URL
        </Link>
        {job.status === "completed" ? (
          <Link href={`/transcripts/${job.jobId}`} className="text-sm underline">
            View transcript
          </Link>
        ) : null}
      </div>
    </div>
  );
}

