"""Utilities for ML inference preprocessing."""

import re
from typing import List


def split_sentences(text: str) -> List[str]:
    """Split input text into normalized, non-empty sentences."""
    normalized = text.strip()
    if not normalized:
        return []

    sentences = re.split(r"(?<=[.!?])\s+", normalized)
    return [sentence.strip() for sentence in sentences if sentence.strip()]
