"""
Multimodal Verification Service using LLaVA via Ollama.
Provides image understanding and multimodal fact-checking capabilities.
"""

import logging
import base64
from typing import Dict, Any, Optional, List
from io import BytesIO

from app.core import settings

logger = logging.getLogger(__name__)

# Lazy import to avoid dependency issues
ollama = None
try:
    import ollama
except ImportError:
    logger.warning("Ollama package not installed. Multimodal features disabled.")


def is_multimodal_available() -> bool:
    """Check if multimodal capabilities are available."""
    if not settings.OLLAMA_ENABLED:
        return False

    if ollama is None:
        return False

    try:
        # Quick check if Ollama is running
        response = ollama.list()
        models = [model['name'] for model in response.get('models', [])]
        return settings.OLLAMA_MODEL in models
    except Exception as e:
        logger.warning(f"Ollama not available: {e}")
        return False


def generate_image_caption(image_bytes: bytes) -> Optional[str]:
    """
    Generate a factual caption for an image using LLaVA.

    Args:
        image_bytes: Raw image bytes

    Returns:
        Caption string or None if failed
    """
    if not is_multimodal_available():
        logger.warning("Multimodal not available for caption generation")
        return None

    try:
        # Encode image to base64
        image_b64 = base64.b64encode(image_bytes).decode()

        prompt = "Describe this image in a clear and factual way. Focus only on visible elements. Avoid assumptions or opinions."

        response = ollama.chat(
            model=settings.OLLAMA_MODEL,
            messages=[{
                'role': 'user',
                'content': prompt,
                'images': [image_b64]
            }],
            options={
                'temperature': 0.1,  # Low temperature for factual descriptions
                'num_predict': 100
            }
        )

        caption = response['message']['content'].strip()
        logger.info(f"Generated image caption: {caption[:100]}...")
        return caption

    except Exception as e:
        logger.error(f"Failed to generate image caption: {e}")
        return None


def extract_claims_from_image(image_bytes: bytes, ocr_text: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Extract check-worthy claims from an image using LLaVA.

    Args:
        image_bytes: Raw image bytes

    Returns:
        List of claim dictionaries with 'sentence' and 'confidence'
    """
    if ocr_text:
        # For text-based images, extract claims from OCR text using text pipeline
        from app.ml.pipeline import extract_checkworthy_claims
        raw_claims = extract_checkworthy_claims(ocr_text, threshold=0.5)
        claims = []
        for rc in raw_claims:
            claims.append({
                'sentence': rc['sentence'],
                'confidence': float(rc.get('confidence', 0.8))
            })
        logger.info(f"Extracted {len(claims)} claims from OCR text")
        return claims

    # Otherwise, use multimodal extraction from image

    try:
        image_b64 = base64.b64encode(image_bytes).decode()

        base_prompt = """From this image, extract any factual or check-worthy claims.

Return in this format:
- Claim 1: [exact text from image]
- Claim 2: [exact text from image]

Only include objective, verifiable statements. Ignore opinions or decorative text."""

        if ocr_text:
            prompt = f"{base_prompt}\n\nOCR Text from image: {ocr_text}"
        else:
            prompt = base_prompt

        response = ollama.chat(
            model=settings.OLLAMA_MODEL,
            messages=[{
                'role': 'user',
                'content': prompt,
                'images': [image_b64]
            }],
            options={
                'temperature': 0.2,
                'num_predict': 200
            }
        )

        content = response['message']['content'].strip()
        logger.info(f"Full LLaVA response for claim extraction: {content}")

        # Parse claims from response
        claims = []
        for line in content.split('\n'):
            line = line.strip()
            if line.startswith('- Claim') or line.startswith('Claim'):
                # Extract claim text after colon
                if ':' in line:
                    claim_text = line.split(':', 1)[1].strip()
                    if claim_text:
                        claims.append({
                            'sentence': claim_text,
                            'confidence': 0.8  # Default confidence for extracted claims
                        })

        logger.info(f"Extracted {len(claims)} claims from image")
        return claims

    except Exception as e:
        logger.error(f"Failed to extract claims from image: {e}")
        return []


def verify_claim_multimodal(claim: str, image_bytes: bytes, image_description: Optional[str] = None) -> Dict[str, Any]:
    """
    Verify a claim using multimodal reasoning (text + image).

    Args:
        claim: Text claim to verify
        image_bytes: Image bytes for multimodal context
        image_description: Optional pre-computed image description

    Returns:
        Dict with verdict, confidence, reasoning, and caption
    """
    if not is_multimodal_available():
        logger.warning("Multimodal not available for verification")
        return {
            'verdict': 'NEUTRAL',
            'confidence': 0.5,
            'reasoning': 'Multimodal verification not available',
            'caption': image_description or 'N/A'
        }

    try:
        image_b64 = base64.b64encode(image_bytes).decode()

        # Get image description if not provided
        if not image_description:
            image_description = generate_image_caption(image_bytes) or "Image description unavailable"

        prompt = f"""You are verifying a claim using an image.

Claim: "{claim}"

Image Description: "{image_description}"

Step 1: Based on the image description, determine whether the image SUPPORTS, REFUTES, or is NEUTRAL to the claim.

Step 2: Provide brief reasoning.

Return strictly in this format:
Verdict: SUPPORTS / REFUTES / NEUTRAL
Confidence: [0.0-1.0]
Reasoning: [brief explanation]"""

        response = ollama.chat(
            model=settings.OLLAMA_MODEL,
            messages=[{
                'role': 'user',
                'content': prompt,
                'images': [image_b64]
            }],
            options={
                'temperature': 0.1,  # Low temperature for consistent verdicts
                'num_predict': 150
            }
        )

        content = response['message']['content'].strip()

        # Parse response
        verdict = 'NEUTRAL'
        confidence = 0.5
        reasoning = content

        # Extract verdict
        for line in content.split('\n'):
            line = line.strip()
            if line.startswith('Verdict:'):
                verdict_part = line.split(':', 1)[1].strip().upper()
                if verdict_part in ['SUPPORTS', 'REFUTES', 'NEUTRAL']:
                    verdict = verdict_part
            elif line.startswith('Confidence:'):
                try:
                    confidence = float(line.split(':', 1)[1].strip())
                    confidence = max(0.0, min(1.0, confidence))  # Clamp to [0,1]
                except ValueError:
                    pass
            elif line.startswith('Reasoning:'):
                reasoning = line.split(':', 1)[1].strip()

        result = {
            'verdict': verdict,
            'confidence': confidence,
            'reasoning': reasoning,
            'caption': image_description
        }

        logger.info(f"Multimodal verification result: {verdict} (conf: {confidence:.2f})")
        return result

    except Exception as e:
        logger.error(f"Multimodal verification failed: {e}")
        return {
            'verdict': 'NEUTRAL',
            'confidence': 0.5,
            'reasoning': f'Verification failed: {str(e)}',
            'caption': image_description or 'N/A'
        }


def apply_multimodal_override(text_verdict: str, multimodal_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Apply multimodal verification results to override or boost text-only verdict.

    Decision logic:
    - If multimodal REFUTES: always REFUTES
    - If multimodal SUPPORTS: boost confidence or override to SUPPORTS
    - If multimodal NEUTRAL: keep text verdict

    Args:
        text_verdict: Original text-only verdict ('SUPPORTS', 'REFUTES', 'NEUTRAL')
        multimodal_result: Result from verify_claim_multimodal()

    Returns:
        Updated verdict dict with multimodal reasoning
    """
    mm_verdict = multimodal_result.get('verdict', 'NEUTRAL')
    mm_confidence = multimodal_result.get('confidence', 0.5)
    mm_reasoning = multimodal_result.get('reasoning', '')

    # Priority: REFUTES > SUPPORTS > NEUTRAL
    if mm_verdict == 'REFUTES':
        final_verdict = 'REFUTES'
        final_confidence = max(mm_confidence, 0.8)  # High confidence for contradictions
        reasoning = f"Image contradicts claim: {mm_reasoning}"
    elif mm_verdict == 'SUPPORTS':
        if text_verdict == 'REFUTES':
            # Multimodal support overrides text refute
            final_verdict = 'SUPPORTS'
            final_confidence = mm_confidence
            reasoning = f"Image supports claim despite text evidence: {mm_reasoning}"
        else:
            # Boost confidence for agreement
            final_verdict = 'SUPPORTS'
            final_confidence = min(1.0, mm_confidence + 0.2)
            reasoning = f"Image and text both support claim: {mm_reasoning}"
    else:
        # NEUTRAL - keep original verdict
        final_verdict = text_verdict
        final_confidence = mm_confidence * 0.8  # Slightly reduce confidence
        reasoning = f"Image neutral, using text verdict: {mm_reasoning}"

    return {
        'verdict': final_verdict,
        'confidence': final_confidence,
        'reasoning': reasoning,
        'multimodal_verdict': mm_verdict,
        'multimodal_confidence': mm_confidence,
        'multimodal_reasoning': mm_reasoning
    }
