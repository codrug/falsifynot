"""
Web Scraper Service for extracting article text from URLs.
Uses newspaper3k for clean article extraction with BeautifulSoup fallback.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


def extract_text_from_url(url: str) -> dict:
    """Extract article text and metadata from a web URL.

    Args:
        url: The web URL to scrape.

    Returns:
        Dict with 'title', 'text', 'authors', and 'source_url'.
        Returns empty text if extraction fails.
    """
    result = {
        "title": "",
        "text": "",
        "authors": [],
        "source_url": url,
    }

    # Try newspaper3k first (best for news articles)
    try:
        from newspaper import Article

        article = Article(url)
        article.download()
        article.parse()

        result["title"] = article.title or ""
        result["text"] = article.text or ""
        result["authors"] = article.authors or []

        if result["text"].strip():
            logger.info(
                f"newspaper3k extracted {len(result['text'])} chars from {url}"
            )
            return result

    except ImportError:
        logger.warning("newspaper3k not installed, falling back to BeautifulSoup.")
    except Exception as e:
        logger.warning(f"newspaper3k failed for {url}: {e}. Trying BeautifulSoup.")

    # Fallback: BeautifulSoup + requests
    try:
        import requests
        from bs4 import BeautifulSoup

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # Remove script/style/nav elements
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        # Extract title
        title_tag = soup.find("title")
        if title_tag:
            result["title"] = title_tag.get_text(strip=True)

        # Extract main content — try <article> first, then <main>, then <body>
        content_tag = soup.find("article") or soup.find("main") or soup.find("body")
        if content_tag:
            paragraphs = content_tag.find_all("p")
            text_parts = [p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 30]
            result["text"] = "\n".join(text_parts)

        if result["text"].strip():
            logger.info(
                f"BeautifulSoup extracted {len(result['text'])} chars from {url}"
            )
        else:
            logger.warning(f"No meaningful text extracted from {url}")

    except ImportError:
        logger.error("Neither newspaper3k nor beautifulsoup4 is installed.")
    except Exception as e:
        logger.error(f"Web scraping failed for {url}: {e}")

    return result


def is_web_url(url: str) -> bool:
    """Check if a string is a web URL (not YouTube)."""
    url_lower = url.strip().lower()
    if not (url_lower.startswith("http://") or url_lower.startswith("https://")):
        return False
    # Exclude YouTube URLs
    youtube_domains = ["youtube.com", "youtu.be", "www.youtube.com", "m.youtube.com"]
    for domain in youtube_domains:
        if domain in url_lower:
            return False
    return True
