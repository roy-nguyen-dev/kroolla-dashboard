import { UrlForm } from "@/components/url-form";

export default function SubmitPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Submit Video URL</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Supported providers: YouTube, Vimeo, and TikTok.
      </p>
      <div className="mt-6 rounded-lg border border-zinc-200 p-6">
        <UrlForm />
      </div>
    </div>
  );
}

