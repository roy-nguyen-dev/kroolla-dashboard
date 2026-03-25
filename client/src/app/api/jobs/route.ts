import { NextResponse } from "next/server";

import {
  createJob,
  createVideo,
  findLatestActiveJobByVideo,
  findVideoByUrl,
} from "@/lib/supabase";
import { inferSourceType, isAllowedVideoUrl } from "@/lib/validators";
import { triggerWorkerJob } from "@/lib/worker-client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { videoUrl?: string };
    const videoUrl = body.videoUrl?.trim();

    if (!videoUrl || !isAllowedVideoUrl(videoUrl)) {
      return NextResponse.json(
        { error: "Please provide a supported YouTube or Vimeo URL." },
        { status: 400 },
      );
    }

    const sourceType = inferSourceType(videoUrl);
    const existingVideo = await findVideoByUrl(videoUrl);
    const video =
      existingVideo ??
      (await createVideo({ source_url: videoUrl, source_type: sourceType }));

    const existingActiveJob = await findLatestActiveJobByVideo(video.id);
    if (existingActiveJob) {
      return NextResponse.json({
        jobId: existingActiveJob.id,
        status: existingActiveJob.status,
        reused: true,
      });
    }

    const job = await createJob({
      video_id: video.id,
      provider: "faster-whisper",
      model_name: "small",
    });

    try {
      await triggerWorkerJob({
        jobId: job.id,
        videoUrl,
        sourceType,
      });
    } catch (workerError) {
      console.error("Failed to trigger worker", {
        jobId: job.id,
        error: workerError,
      });
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      reused: false,
    });
  } catch (error) {
    console.error("POST /api/jobs failed", error);
    return NextResponse.json(
      { error: "Unable to create transcription job." },
      { status: 500 },
    );
  }
}

