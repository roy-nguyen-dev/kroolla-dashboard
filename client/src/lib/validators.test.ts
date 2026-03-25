import { describe, expect, it } from "vitest";

import { inferSourceType, isAllowedVideoUrl } from "./validators";

describe("validators", () => {
  it("accepts supported providers", () => {
    expect(isAllowedVideoUrl("https://www.youtube.com/watch?v=abc")).toBe(true);
    expect(isAllowedVideoUrl("https://youtu.be/abc")).toBe(true);
    expect(isAllowedVideoUrl("https://vimeo.com/123")).toBe(true);
  });

  it("rejects unsupported domains", () => {
    expect(isAllowedVideoUrl("https://example.com/video")).toBe(false);
  });

  it("infers source type", () => {
    expect(inferSourceType("https://www.youtube.com/watch?v=abc")).toBe("youtube");
    expect(inferSourceType("https://vimeo.com/123")).toBe("vimeo");
    expect(inferSourceType("https://example.com/video")).toBe("other");
  });
});

