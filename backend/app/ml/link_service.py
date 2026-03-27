"""
Link Service for generating external evidence links.
Creates Wikipedia URLs from evidence page titles and YouTube search links from claims.
No heavy APIs or web crawling — simple, clean, and explainable.
"""

import re
import logging
from typing import List, Dict, Optional
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)


def generate_wikipedia_link(page_title: str) -> Optional[str]:
    """Convert a Wikipedia page title into a full URL.

    Args:
        page_title: The Wikipedia page title (e.g., "Coronary_ischemia").

    Returns:
        Full Wikipedia URL, or None if the title is empty/invalid.
    """
    if not page_title or not page_title.strip():
        return None

    cleaned = page_title.strip()
    # Replace spaces with underscores (Wikipedia convention)
    cleaned = cleaned.replace(" ", "_")
    # Remove bracket artifacts like [PageTitle]
    cleaned = re.sub(r"^\[|\]$", "", cleaned)

    if not cleaned or cleaned.lower() in {"unknown", "none", "n/a"}:
        return None

    return f"https://en.wikipedia.org/wiki/{quote_plus(cleaned)}"


def generate_youtube_search_url(query: str) -> Optional[str]:
    """Generate a YouTube search URL for a claim/query.

    Args:
        query: The search query (claim text).

    Returns:
        YouTube search URL, or None if query is empty.
    """
    if not query or not query.strip():
        return None

    # Clean and truncate query for YouTube search
    cleaned = query.strip()[:120]
    return f"https://www.youtube.com/results?search_query={quote_plus(cleaned)}"


def generate_external_evidence(
    claim_text: str,
    evidence_sources: List[str],
) -> Dict:
    """Generate external evidence links for a claim.

    Args:
        claim_text: The claim text to search for.
        evidence_sources: List of Wikipedia page titles from retrieved evidence.

    Returns:
        Dict with 'web_sources' and 'video_sources' lists.
    """
    web_sources = []
    seen_titles = set()

    for source in evidence_sources:
        if not source or source.lower() in {"unknown", "none", ""}:
            continue

        normalized = source.strip().lower()
        if normalized in seen_titles:
            continue
        seen_titles.add(normalized)

        url = generate_wikipedia_link(source)
        if url:
            web_sources.append({
                "title": f"Wikipedia: {source.strip()}",
                "url": url,
            })

    # Limit to top 3 most relevant web sources
    web_sources = web_sources[:3]

    # Generate YouTube search link
    video_sources = []
    yt_url = generate_youtube_search_url(claim_text)
    if yt_url:
        # Create a readable title from the claim
        short_claim = claim_text[:60] + ("..." if len(claim_text) > 60 else "")
        video_sources.append({
            "title": f"YouTube: {short_claim}",
            "url": yt_url,
        })

    return {
        "web_sources": web_sources,
        "video_sources": video_sources,
    }
