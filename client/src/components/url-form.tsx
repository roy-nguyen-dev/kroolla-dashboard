"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CreateJobResponse = {
  jobId: string;
  status: string;
  reused: boolean;
};

export function UrlForm() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });
      const data = (await response.json()) as CreateJobResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create job.");
      }

      router.push(`/jobs/${data.jobId}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unexpected error.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-3">
      <label htmlFor="video-url" className="text-sm font-medium">
        Video URL
      </label>
      <input
        id="video-url"
        name="video-url"
        type="url"
        required
        value={videoUrl}
        onChange={(event) => setVideoUrl(event.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
        className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-700"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Start Transcription"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}

