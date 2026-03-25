import { z } from "zod";

const ALLOWED_VIDEO_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "www.vimeo.com",
]);

export const createJobSchema = z.object({
  videoUrl: z.string().url("Please enter a valid URL."),
});

export function isAllowedVideoUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      ALLOWED_VIDEO_HOSTS.has(parsed.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

export function inferSourceType(rawUrl: string): "youtube" | "vimeo" | "other" {
  const hostname = new URL(rawUrl).hostname.toLowerCase();
  if (hostname.includes("youtube") || hostname === "youtu.be") return "youtube";
  if (hostname.includes("vimeo")) return "vimeo";
  return "other";
}

