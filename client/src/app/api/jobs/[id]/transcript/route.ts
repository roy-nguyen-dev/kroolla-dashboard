import { NextResponse } from "next/server";

import {
  getJobById,
  getSegmentsByJobId,
  getTranscriptDocumentByJobId,
} from "@/lib/supabase";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const job = await getJobById(id);

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const [document, segments] = await Promise.all([
      getTranscriptDocumentByJobId(id),
      getSegmentsByJobId(id),
    ]);

    return NextResponse.json({
      jobId: id,
      status: job.status,
      fullText: document?.full_text ?? "",
      summary: document?.summary ?? null,
      segments,
    });
  } catch (error) {
    console.error("GET /api/jobs/[id]/transcript failed", error);
    return NextResponse.json(
      { error: "Unable to fetch transcript." },
      { status: 500 },
    );
  }
}

