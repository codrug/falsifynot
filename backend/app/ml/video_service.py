"""
Video Service for extracting transcripts from YouTube videos.
Uses youtube-transcript-api for lightweight transcript extraction.
"""

import logging
import json
from urllib.parse import parse_qs, urlparse
from urllib.request import urlopen
from typing import Optional

logger = logging.getLogger(__name__)


def extract_video_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from various URL formats.

    Supports:
        - https://www.youtube.com/watch?v=VIDEO_ID
        - https://youtu.be/VIDEO_ID
        - https://www.youtube.com/embed/VIDEO_ID
        - https://m.youtube.com/watch?v=VIDEO_ID
    """
    try:
        parsed = urlparse(url.strip())
        host = (parsed.netloc or "").lower()
        path = (parsed.path or "").strip("/")

        if "youtu.be" in host:
            video_id = path.split("/")[0] if path else ""
            return video_id[:11] if len(video_id) >= 11 else None

        if "youtube.com" in host:
            query = parse_qs(parsed.query)
            if query.get("v"):
                video_id = query["v"][0]
                return video_id[:11] if len(video_id) >= 11 else None

            if path.startswith("embed/") or path.startswith("v/") or path.startswith("shorts/") or path.startswith("live/"):
                video_id = path.split("/")[1] if "/" in path else ""
                return video_id[:11] if len(video_id) >= 11 else None
    except Exception:
        return None

    return None


def _fetch_youtube_title(url: str) -> str:
    """Fetch video title from YouTube oEmbed endpoint as a transcript fallback."""
    try:
        endpoint = f"https://www.youtube.com/oembed?url={url}&format=json"
        with urlopen(endpoint, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8", errors="ignore"))
            title = str(payload.get("title") or "").strip()
            return title
    except Exception:
        return ""


def extract_transcript(url: str) -> dict:
    """Extract transcript text from a YouTube video.

    Args:
        url: YouTube video URL.

    Returns:
        Dict with 'video_id', 'title', 'text', and 'source_url'.
        Returns empty text if extraction fails.
    """
    result = {
        "video_id": "",
        "title": "",
        "text": "",
        "source_url": url,
        "transcript_status": "unknown",
        "fallback_used": None,
        "reason": "",
    }

    video_id = extract_video_id(url)
    if not video_id:
        logger.warning(f"Could not extract video ID from URL: {url}")
        result["transcript_status"] = "invalid_url"
        result["reason"] = "Could not parse YouTube video ID"
        return result

    result["video_id"] = video_id

    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound

        transcript_list = None

        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=["en", "en-US", "en-GB"])
        except Exception:
            # Fallback chain: try explicit transcript discovery and translation.
            transcript_candidates = YouTubeTranscriptApi.list_transcripts(video_id)
            selected = None
            try:
                selected = transcript_candidates.find_transcript(["en", "en-US", "en-GB"])
            except Exception:
                try:
                    generated = transcript_candidates.find_generated_transcript(["en", "en-US", "en-GB"])
                    selected = generated
                except Exception:
                    selected = None

            if selected is not None:
                try:
                    transcript_list = selected.fetch()
                except Exception:
                    try:
                        transcript_list = selected.translate("en").fetch()
                    except Exception:
                        transcript_list = None

        if not transcript_list:
            raise NoTranscriptFound(video_id, ["en", "en-US", "en-GB"], None)

        # Combine all transcript segments into full text
        text_parts = [entry["text"] for entry in transcript_list if entry.get("text")]
        result["text"] = " ".join(text_parts).strip()

        if result["text"]:
            result["transcript_status"] = "ok"
            logger.info(
                f"Extracted transcript ({len(result['text'])} chars) from video {video_id}"
            )
        else:
            result["transcript_status"] = "empty"
            result["reason"] = "Transcript returned no text"
            logger.warning(f"Transcript was empty for video {video_id}")

    except TranscriptsDisabled:
        result["transcript_status"] = "disabled"
        result["reason"] = "Subtitles are disabled for this video"
        logger.error("Transcript extraction failed for %s: subtitles disabled", video_id)
    except NoTranscriptFound:
        result["transcript_status"] = "not_found"
        result["reason"] = "No matching transcript found"
        logger.error("Transcript extraction failed for %s: transcript not found", video_id)

    except ImportError:
        result["transcript_status"] = "dependency_missing"
        result["reason"] = "youtube-transcript-api not installed"
        logger.error("youtube-transcript-api not installed. Cannot extract video transcripts.")
    except Exception as e:
        result["transcript_status"] = "failed"
        result["reason"] = str(e)
        logger.error(f"Transcript extraction failed for {video_id}: {e}")

    if not result["title"]:
        result["title"] = _fetch_youtube_title(url)

    if not result["text"] and result["title"]:
        # Keep pipeline alive with at least one meaningful sentence from the source metadata.
        result["text"] = result["title"]
        result["fallback_used"] = "title"
        logger.info("Using YouTube title as fallback text for %s", video_id)

    return result


def is_youtube_url(url: str) -> bool:
    """Check if a string is a YouTube URL."""
    url_lower = url.strip().lower()
    youtube_domains = ["youtube.com", "youtu.be", "www.youtube.com", "m.youtube.com"]
    return any(domain in url_lower for domain in youtube_domains)
