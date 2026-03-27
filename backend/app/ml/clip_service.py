"""
CLIP Service for computing image-text semantic similarity.
Uses sentence-transformers/clip-ViT-B-32 for lightweight multimodal alignment.
"""

import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Lazy-loaded model instance
_model = None
_processor = None


def _get_model():
    """Lazy-load CLIP model to avoid startup overhead."""
    global _model, _processor
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading CLIP model (clip-ViT-B-32)...")
            _model = SentenceTransformer("clip-ViT-B-32")
            logger.info("[OK] CLIP model loaded.")
        except ImportError:
            logger.warning("sentence-transformers not available for CLIP.")
            return None
        except Exception as e:
            logger.error(f"Failed to load CLIP model: {e}")
            return None
    return _model


def compute_image_text_similarity(image_bytes: bytes, text: str) -> float:
    """Compute semantic similarity between an image and text using CLIP.

    Args:
        image_bytes: Raw bytes of the image file.
        text: Text string to compare against the image.

    Returns:
        Similarity score between 0 and 1. Returns 0.0 if CLIP is unavailable.
    """
    model = _get_model()
    if model is None or not text or not text.strip():
        return 0.0

    try:
        from PIL import Image
        import numpy as np

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Encode image and text
        image_embedding = model.encode(image)
        text_embedding = model.encode(text)

        # Cosine similarity
        similarity = float(np.dot(image_embedding, text_embedding) / (
            np.linalg.norm(image_embedding) * np.linalg.norm(text_embedding) + 1e-8
        ))

        # Clamp to [0, 1]
        similarity = max(0.0, min(1.0, similarity))

        logger.info(f"CLIP similarity: {similarity:.4f} for text: {text[:80]}...")
        return similarity

    except Exception as e:
        logger.error(f"CLIP similarity computation failed: {e}")
        return 0.0
