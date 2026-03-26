from urllib.parse import urlparse


ALLOWED_VIDEO_HOSTS = {
    "youtube.com",
    "www.youtube.com",
    "youtu.be",
    "vimeo.com",
    "www.vimeo.com",
    "tiktok.com",
    "www.tiktok.com",
    "m.tiktok.com",
    "vm.tiktok.com",
    "vt.tiktok.com",
}

ALLOWED_SOURCE_TYPES = {"youtube", "vimeo", "direct_file", "other"}


def is_allowed_video_url(raw_url: str) -> bool:
    parsed = urlparse(raw_url)
    if parsed.scheme not in {"http", "https"}:
        return False
    hostname = (parsed.hostname or "").lower()
    return hostname in ALLOWED_VIDEO_HOSTS
