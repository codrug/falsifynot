"""
OCR Service for extracting text from images.
Uses EasyOCR for reliable text extraction from uploaded images.
"""

import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Lazy-loaded reader instance
_reader = None


def _get_reader():
    """Lazy-load EasyOCR reader to avoid startup overhead."""
    global _reader
    if _reader is None:
        try:
            import easyocr
            logger.info("Loading EasyOCR reader...")
            _reader = easyocr.Reader(["en"], gpu=False)
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

        extracted = " ".join(results).strip()
        logger.info(f"OCR extracted {len(extracted)} characters from image.")
        return extracted

    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        return ""
