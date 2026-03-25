import { NextResponse } from "next/server";

import { mapJobStatusResponse } from "@/lib/api-mappers";
import {
  getJobById,
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

    return NextResponse.json(mapJobStatusResponse(job));
  } catch (error) {
    console.error("GET /api/jobs/[id] failed", error);
    return NextResponse.json(
      { error: "Unable to fetch job status." },
      { status: 500 },
    );
  }
}

