import { JobStatus } from "@/components/job-status";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Transcription Job</h1>
      <p className="mt-2 text-sm text-zinc-600">
        This page auto-refreshes while the job is in progress.
      </p>
      <div className="mt-6">
        <JobStatus jobId={id} />
      </div>
    </div>
  );
}

