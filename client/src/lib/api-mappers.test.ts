import { describe, expect, it } from "vitest";

import { mapJobStatusResponse } from "./api-mappers";

describe("mapJobStatusResponse", () => {
  it("maps DB row shape into API response", () => {
    const mapped = mapJobStatusResponse({
      id: "job-1",
      video_id: "video-1",
      status: "processing",
      provider: "faster-whisper",
      model_name: "small",
      language: "en",
      error_message: null,
      created_at: "2026-01-01T00:00:00Z",
      started_at: "2026-01-01T00:00:01Z",
      finished_at: null,
    });

    expect(mapped).toEqual({
      jobId: "job-1",
      status: "processing",
      provider: "faster-whisper",
      modelName: "small",
      language: "en",
      errorMessage: null,
      startedAt: "2026-01-01T00:00:01Z",
      finishedAt: null,
      createdAt: "2026-01-01T00:00:00Z",
    });
  });
});

