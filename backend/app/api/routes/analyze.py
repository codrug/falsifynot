"""Analyze API routes — supports text-only and multimodal (text + image) analysis."""

from datetime import datetime
import re
from uuid import uuid4
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile, HTTPException, status

from app.core import get_logger, settings
from app.models.schemas import (
    AnalyzeResponse, ExtractedClaim, EvidenceResult,
    VisualContext, MultimodalContribution, ExternalEvidence,
    WebSource, VideoSource,
)

from app.services.analysis_service import AnalysisService
from app.ml.web_scraper import extract_text_from_url, is_web_url
from app.ml.video_service import extract_transcript, is_youtube_url
from app.ml.ocr_service import extract_text_from_image

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1", tags=["analysis"])

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "is", "it",
    "its", "of", "on", "or", "that", "the", "to", "was", "were", "will", "with", "this", "these", "those",
}

def _run_pipeline_for_text(
    text: str,
    image_bytes: Optional[bytes] = None,
    ocr_text: Optional[str] = None,
    source_type: str = "text",
    source_url: Optional[str] = None,
    source_title: Optional[str] = None,
    source_extension: Optional[str] = None,
    source_name: Optional[str] = None,
):
    """Run the core claim extraction + evidence + verification pipeline.
    
    Returns list of ExtractedClaim dicts (not yet Pydantic objects).
    """
    return AnalysisService.extract_claims_from_text(
        text=text,
        image_bytes=image_bytes,
        ocr_text=ocr_text,
        source_type=source_type,
        source_url=source_url,
        source_title=source_title,
        source_extension=source_extension,
        source_name=source_name,
    )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    source_name: Optional[str] = Form(None),
    source_extension: Optional[str] = Form(None),
) -> AnalyzeResponse:
    """Analyze incoming text (and optional image) for fake news verification.
    
    Accepts multipart/form-data with:
    - text (required): Raw input text to analyze
    - image (optional): Image file (.jpg, .png) for multimodal analysis
    """
    logger.info("Received analyze request (multimodal=%s)", image is not None)
    
    # Read image bytes if provided
    image_bytes: Optional[bytes] = None
    if image and image.filename:
        try:
            image_bytes = await image.read()
            logger.info(f"Received image: {image.filename} ({len(image_bytes)} bytes)")
        except Exception as e:
            logger.error(f"Failed to read image: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image file provided"
            )
    
    # Normalize optional text input so image-only requests don't fail validation.
    normalized_text = (text or "").strip()

    if not normalized_text and not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either text or image must be provided"
        )

    # Determine if input is a URL and extract text/metadata
    source_type = "text"
    source_url = None
    source_title = None
    processing_meta = None

    if normalized_text and is_youtube_url(normalized_text):
        source_type = "video"
        source_url = normalized_text
        logger.info(f"Processing YouTube URL: {source_url}")
        video_data = extract_transcript(source_url)
        normalized_text = video_data["text"]
        source_title = video_data["title"]
        processing_meta = {
            "source_type": "video",
            "video_id": video_data.get("video_id"),
            "transcript_status": video_data.get("transcript_status"),
            "fallback_used": video_data.get("fallback_used"),
            "reason": video_data.get("reason"),
        }
    elif normalized_text and is_web_url(normalized_text):
        source_type = "web"
        source_url = normalized_text
        logger.info(f"Processing Web URL: {source_url}")
        web_data = extract_text_from_url(source_url)
        normalized_text = web_data["text"]
        source_title = web_data["title"]
        
    # If image is provided and text is minimal, try to extract text from image via OCR
    ocr_text = ""
    if image_bytes:
        source_type = "image" if not normalized_text else f"{source_type}+image"
        logger.info("Running OCR on uploaded image...")
        ocr_text = extract_text_from_image(image_bytes)
        if ocr_text:
            logger.info("OCR extracted text:\n%s", ocr_text)
        else:
            logger.info("OCR extracted text: (none)")
    
    # Merge OCR text with input text, normalizing line breaks so sentence splitting works better.
    analysis_text = normalized_text
    if ocr_text:
        normalized_ocr = " ".join(ocr_text.split())
        logger.info("OCR normalized text: %s", normalized_ocr)
        analysis_text = f"{analysis_text} {normalized_ocr}".strip()
    
    if not analysis_text:
        return AnalyzeResponse(claims=[], processing_meta=processing_meta)
    
    # Run text-only pipeline first
    text_only_data = _run_pipeline_for_text(
        normalized_text,
        image_bytes=None, 
        source_type=source_type, 
        source_url=source_url, 
        source_title=source_title,
        source_extension=source_extension,
        source_name=source_name,
    )
    
    # If we have image context, run the augmented pipeline too
    if ocr_text and analysis_text != normalized_text:
        augmented_data = _run_pipeline_for_text(
            analysis_text, 
            image_bytes=image_bytes, 
            ocr_text=normalized_ocr,
            source_type=source_type, 
            source_url=source_url, 
            source_title=source_title,
            source_extension=source_extension,
            source_name=source_name,
        )
    else:
        augmented_data = None
    
    # Build final claims using service
    claims_with_evidence = AnalysisService.build_extracted_claims(
        claims_data=augmented_data if augmented_data else text_only_data,
        text_only_data=text_only_data if augmented_data else None,
        image_bytes=image_bytes,
    )
        
    return AnalyzeResponse(claims=claims_with_evidence, processing_meta=processing_meta)


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
    }
