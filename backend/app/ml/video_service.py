"""
Video Service for extracting transcripts from YouTube videos.
Uses youtube-transcript-api for lightweight transcript extraction.
"""

import re
import logging
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
    patterns = [
        r"(?:youtube\.com\/watch\?v=)([\w-]{11})",
        r"(?:youtu\.be\/)([\w-]{11})",
        r"(?:youtube\.com\/embed\/)([\w-]{11})",
        r"(?:youtube\.com\/v\/)([\w-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


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
    }

    video_id = extract_video_id(url)
    if not video_id:
        logger.warning(f"Could not extract video ID from URL: {url}")
        return result

    result["video_id"] = video_id

    try:
        from youtube_transcript_api import YouTubeTranscriptApi

        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])

        # Combine all transcript segments into full text
        text_parts = [entry["text"] for entry in transcript_list if entry.get("text")]
        result["text"] = " ".join(text_parts).strip()

        if result["text"]:
            logger.info(
                f"Extracted transcript ({len(result['text'])} chars) from video {video_id}"
            )
        else:
            logger.warning(f"Transcript was empty for video {video_id}")

    except ImportError:
        logger.error("youtube-transcript-api not installed. Cannot extract video transcripts.")
    except Exception as e:
        logger.error(f"Transcript extraction failed for {video_id}: {e}")

    return result


def is_youtube_url(url: str) -> bool:
    """Check if a string is a YouTube URL."""
    url_lower = url.strip().lower()
    youtube_domains = ["youtube.com", "youtu.be", "www.youtube.com", "m.youtube.com"]
    return any(domain in url_lower for domain in youtube_domains)
