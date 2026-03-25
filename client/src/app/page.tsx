import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-14">
      <main className="rounded-lg border border-zinc-200 p-8">
        <h1 className="text-2xl font-semibold">Kroolla Transcriber</h1>
        <p className="mt-3 text-zinc-600">
          Submit a video URL and track transcription progress in real time.
        </p>
        <div className="mt-6">
          <Link
            href="/submit"
            className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-white"
          >
            Start now
          </Link>
        </div>
      </main>
    </div>
  );
}
