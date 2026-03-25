import Link from "next/link";

import { TranscriptView } from "@/components/transcript-view";
import {
  getJobById,
  getSegmentsByJobId,
  getTranscriptDocumentByJobId,
} from "@/lib/supabase";

type TranscriptResponse = {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  fullText: string;
  summary: string | null;
  segments: Array<{
    id: number;
    segment_index: number;
    start_ms: number;
    end_ms: number;
    speaker: string | null;
    text: string;
  }>;
  error?: string;
};

type Props = {
  params: Promise<{ jobId: string }>;
};

export default async function TranscriptPage({ params }: Props) {
  const { jobId } = await params;
  const job = await getJobById(jobId);
  if (!job) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Transcript</h1>
        <p className="mt-3 text-sm text-red-600">Job not found.</p>
      </div>
    );
  }

  const [document, segments] = await Promise.all([
    getTranscriptDocumentByJobId(jobId),
    getSegmentsByJobId(jobId),
  ]);

  const transcript: TranscriptResponse = {
    jobId,
    status: job.status,
    fullText: document?.full_text ?? "",
    summary: document?.summary ?? null,
    segments: segments.map((segment) => ({
      id: segment.id,
      segment_index: segment.segment_index,
      start_ms: segment.start_ms,
      end_ms: segment.end_ms,
      speaker: segment.speaker,
      text: segment.text,
    })),
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transcript</h1>
        <Link href={`/jobs/${jobId}`} className="text-sm underline">
          Back to job status
        </Link>
      </div>
      {transcript.status !== "completed" ? (
        <p className="mb-4 text-sm text-zinc-600">
          Current status: <span className="font-medium">{transcript.status}</span>
        </p>
      ) : null}
      <TranscriptView data={transcript} />
    </div>
  );
}

