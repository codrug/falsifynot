"""
OCR Service for extracting text from images.
Uses EasyOCR for reliable text extraction from uploaded images.
"""

import io
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# Lazy-loaded reader instance
_reader = None


def _normalize_line(line: str) -> str:
    """Normalize OCR line text while preserving meaning."""
    cleaned = " ".join((line or "").split())
    # Drop isolated symbol tokens that usually come from OCR noise.
    tokens = [tok for tok in cleaned.split(" ") if tok and re.search(r"[A-Za-z0-9]", tok)]
    cleaned = " ".join(tokens)
    # Keep common punctuation, remove mostly-decorative noise characters.
    cleaned = re.sub(r"[^A-Za-z0-9\s\.,:;\-\(\)\[\]'\"%]", "", cleaned)
    return " ".join(cleaned.split()).strip()


def _tokenize_for_similarity(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9']+", text.lower()))


def _is_near_duplicate(candidate: str, existing: list[str], threshold: float = 0.85) -> bool:
    cand_tokens = _tokenize_for_similarity(candidate)
    if not cand_tokens:
        return True
    for line in existing:
        line_tokens = _tokenize_for_similarity(line)
        if not line_tokens:
            continue
        overlap = len(cand_tokens.intersection(line_tokens))
        score = overlap / max(1, min(len(cand_tokens), len(line_tokens)))
        if score >= threshold:
            return True
    return False


def _postprocess_ocr_lines(lines: list[str]) -> str:
    """Normalize and deduplicate OCR lines to keep cleaner inputs for the NLP pipeline."""
    compact_lines: list[str] = []
    for raw in lines:
        line = _normalize_line(raw)
        if len(line) < 8:
            continue
        if _is_near_duplicate(line, compact_lines):
            continue
        compact_lines.append(line)

    return "\n".join(compact_lines).strip()


def _get_reader():
    """Lazy-load EasyOCR reader to avoid startup overhead."""
    global _reader
    if _reader is None:
        try:
            import easyocr
            logger.info("Loading EasyOCR reader...")
            # Disable verbose progress bars to avoid Windows console encoding issues.
            _reader = easyocr.Reader(["en"], gpu=False, verbose=False)
            logger.info("[OK] EasyOCR reader loaded.")
        except ImportError:
            logger.warning("easyocr not installed. OCR will be unavailable.")
            return None
        except Exception as e:
            logger.error(f"Failed to load EasyOCR: {e}")
            return None
    return _reader


def extract_text_from_image(image_bytes: bytes) -> str:
    """Extract text from an image using OCR.

    Args:
        image_bytes: Raw bytes of the image file.

    Returns:
        Extracted text string. Empty string if no text found or OCR unavailable.
    """
    reader = _get_reader()
    if reader is None:
        return ""

    try:
        from PIL import Image
        import numpy as np

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image)

        results = reader.readtext(image_np, detail=0)

        if not results:
            logger.info("OCR found no text in the image.")
            return ""

        extracted = _postprocess_ocr_lines([str(item) for item in results])
        logger.info(f"OCR extracted {len(extracted)} characters from image.")
        return extracted

    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        return ""
