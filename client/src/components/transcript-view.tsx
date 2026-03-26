"use client";

import { useMemo } from "react";

type Segment = {
  id: number;
  segment_index: number;
  start_ms: number;
  end_ms: number;
  speaker: string | null;
  text: string;
};

type TranscriptPayload = {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  fullText: string;
  summary: string | null;
  segments: Segment[];
};

function msToTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function TranscriptView({ data }: { data: TranscriptPayload }) {
  const renderedText = useMemo(() => {
    if (data.fullText?.trim()) return data.fullText;
    return data.segments.map((segment) => segment.text).join(" ");
  }, [data.fullText, data.segments]);

  async function copyText() {
    await navigator.clipboard.writeText(renderedText);
  }

  function downloadText() {
    const blob = new Blob([renderedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `transcript-${data.jobId}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-zinc-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Full Transcript</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyText}
              className="rounded bg-zinc-200 px-3 py-1 text-sm"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={downloadText}
              className="rounded bg-zinc-900 px-3 py-1 text-sm text-white"
            >
              Download
            </button>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6 text-white">{renderedText}</p>
      </div>

      <div className="rounded-md border border-zinc-200 p-4">
        <h3 className="mb-3 text-base font-semibold">Segments</h3>
        <div className="space-y-2">
          {data.segments.map((segment) => (
            <div
              key={segment.id}
              className="rounded border border-zinc-100 bg-zinc-50 px-3 py-2"
            >
              <p className="text-xs text-zinc-500">
                {msToTimestamp(segment.start_ms)} - {msToTimestamp(segment.end_ms)}
                {segment.speaker ? ` - ${segment.speaker}` : ""}
              </p>
              <p className="text-sm text-zinc-800">{segment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

