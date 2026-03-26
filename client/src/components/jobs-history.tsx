"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { JobListItem } from "@/lib/types";

type JobsResponse = {
  jobs: JobListItem[];
  error?: string;
};

function formatDate(value: string | null): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

export function JobsHistory() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadJobs() {
      try {
        const response = await fetch("/api/jobs", { cache: "no-store" });
        const data = (await response.json()) as JobsResponse;
        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load jobs.");
        }
        if (!cancelled) {
          setJobs(data.jobs);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Unexpected error.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadJobs();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => jobs, [jobs]);

  if (isLoading) {
    return <p className="text-sm text-zinc-600">Loading jobs...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!rows.length) {
    return (
      <div className="rounded-md border border-zinc-200 p-4 text-sm text-zinc-600">
        No jobs yet. Submit your first video URL.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-zinc-200">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-black">Status</th>
            <th className="px-3 py-2 text-left font-semibold text-black">Video</th>
            <th className="px-3 py-2 text-left font-semibold text-black">Model</th>
            <th className="px-3 py-2 text-left font-semibold text-black">Created</th>
            <th className="px-3 py-2 text-left font-semibold text-black">Summary / Error</th>
            <th className="px-3 py-2 text-left font-semibold text-black">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-white">
          {rows.map((job) => (
            <tr key={job.jobId}>
              <td className="px-3 py-2">{job.status}</td>
              <td className="px-3 py-2">
                <p className="truncate font-medium text-white">{job.videoUrl}</p>
                <p className="text-xs text-zinc-300">{job.sourceType}</p>
              </td>
              <td className="px-3 py-2">
                {job.provider} / {job.modelName}
              </td>
              <td className="px-3 py-2">{formatDate(job.createdAt)}</td>
              <td className="max-w-md px-3 py-2">
                <p className="line-clamp-2 text-white">
                  {job.errorMessage ?? job.summary ?? "-"}
                </p>
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-3">
                  <Link href={`/jobs/${job.jobId}`} className="underline text-white">
                    Status
                  </Link>
                  <Link href={`/transcripts/${job.jobId}`} className="underline text-white">
                    Transcript
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
