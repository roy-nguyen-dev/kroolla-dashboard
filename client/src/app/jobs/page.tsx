import Link from "next/link";

import { JobsHistory } from "@/components/jobs-history";

export default function JobsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Jobs History</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Browse all stored transcription jobs and open their results.
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          New Submission
        </Link>
      </div>
      <JobsHistory />
    </div>
  );
}
