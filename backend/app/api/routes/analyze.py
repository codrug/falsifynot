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

from app.ml.pipeline import extract_checkworthy_claims, retrieve_evidence
from app.ml.verifier import verify_claim
from app.ml.ocr_service import extract_text_from_image
from app.ml.clip_service import compute_image_text_similarity
from app.ml.link_service import generate_external_evidence
from app.ml.web_scraper import extract_text_from_url, is_web_url
from app.ml.video_service import extract_transcript, is_youtube_url

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1", tags=["analysis"])

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "is", "it",
    "its", "of", "on", "or", "that", "the", "to", "was", "were", "will", "with", "this", "these", "those",
}

RETRIEVAL_PREFIXES = (
    "studies show that",
    "study shows that",
    "research shows that",
    "it is claimed that",
    "according to experts",
)

BAD_EVIDENCE_KEYWORDS = {
    "disambiguation",
    "may refer to",
    "genus",
}

OPINION_MARKERS = (
    "i think",
    "i believe",
    "in my opinion",
    "we must",
    "we should",
    "i feel",
    "probably",
    "maybe",
)

CAUSAL_MARKERS = (
    "caused",
    "causes",
    "cause",
    "leads to",
    "led to",
    "results in",
    "resulted in",
    "because",
    "due to",
    "driven by",
    "impact",
    "affect",
)

ASSERTION_MARKERS = (
    " is ",
    " are ",
    " was ",
    " were ",
    " has ",
    " have ",
    " had ",
)

BOILERPLATE_PATTERNS = (
    "all rights reserved",
    "sign in",
    "sign up",
    "log in",
    "already a registered user",
    "continue to engage",
    "subscribe",
    "cookie policy",
    "privacy policy",
    "terms of service",
    "download app",
)


def simplify_claim(claim: str) -> str:
    simplified = claim.strip()
    lower_claim = simplified.lower()
    for prefix in RETRIEVAL_PREFIXES:
        if lower_claim.startswith(prefix):
            simplified = simplified[len(prefix):].strip(" ,.:;-")
            break
    return simplified


def build_retrieval_query(claim: str) -> str:
    simplified = simplify_claim(claim)
    tokens = [token for token in _tokenize(simplified) if token not in STOPWORDS and len(token) > 2]
    important_terms = tokens[:8]
    if important_terms:
        return f"{simplified} {' '.join(important_terms)}"
    return simplified


def filter_evidence(evidence_list: list[dict]) -> list[dict]:
    filtered = []
    for item in evidence_list:
        text = str(item.get("text", "")).lower()
        if any(keyword in text for keyword in BAD_EVIDENCE_KEYWORDS):
            continue
        filtered.append(item)
    return filtered


def normalize_verdict_label(label: str) -> str:
    normalized = (label or "").strip().upper()
    if normalized in {"ENTAILMENT", "SUPPORTS", "SUPPORTED"}:
        return "SUPPORTS"
    if normalized in {"CONTRADICTION", "REFUTES", "REFUTED"}:
        return "REFUTES"
    return "NEUTRAL"


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9']+", text.lower()))


def has_numeric_signal(text: str) -> bool:
    return bool(re.search(r"\b\d+(?:\.\d+)?(?:%|\s?(?:million|billion|trillion|k|km|kg|cm|mm|m|years?|months?|days?|c|f))?\b", text.lower()))


def has_factual_structure(text: str) -> bool:
    lower_text = f" {text.lower().strip()} "
    has_assertion = any(marker in lower_text for marker in ASSERTION_MARKERS)
    has_entity_like_token = bool(re.search(r"\b[A-Z][a-z]{2,}\b", text))
    has_year = bool(re.search(r"\b(19|20)\d{2}\b", text))
    return has_assertion and (has_entity_like_token or has_year)


def classify_claim_type(claim: str) -> str:
    lower_claim = claim.lower()

    if has_numeric_signal(claim):
        return "Statistical"
    if any(marker in lower_claim for marker in CAUSAL_MARKERS):
        return "Causal"
    if any(marker in lower_claim for marker in OPINION_MARKERS):
        return "Opinion"
    if has_factual_structure(claim):
        # Descriptive factual claims are grouped into Causal for the 3-class output.
        return "Causal"
    return "Opinion"


def is_boilerplate_claim(text: str) -> bool:
    normalized = " ".join(text.lower().split())
    if not normalized:
        return True
    if len(normalized.split()) <= 5 and not has_numeric_signal(text):
        return True
    if any(pattern in normalized for pattern in BOILERPLATE_PATTERNS):
        return True
    if normalized.startswith(("read more", "click here", "watch now", "share this")):
        return True
    return False


def is_claim_analyst_worthy(claim: str) -> bool:
    # High-impact gate: discard low-fact claims with neither numeric nor factual structure.
    if is_boilerplate_claim(claim):
        return False
    return has_numeric_signal(claim) or has_factual_structure(claim)


def highlight_overlap(claim: str, evidence: str) -> list[str]:
    claim_words = _tokenize(claim) - STOPWORDS
    evidence_words = _tokenize(evidence) - STOPWORDS
    overlap = claim_words.intersection(evidence_words)
    return sorted(overlap)


def extract_evidence_highlight(evidence_text: str, matched_terms: list[str]) -> str:
    numeric_match = re.search(
        r"\b\d+(?:\.\d+)?\s?(?:%|percent|million|billion|trillion|k|km|kg|cm|mm|m|years?|months?|days?)\b",
        evidence_text,
        flags=re.IGNORECASE,
    )
    if numeric_match:
        return numeric_match.group(0)

    if matched_terms:
        return matched_terms[0]

    words = evidence_text.strip().split()
    return " ".join(words[:6]) if words else ""


def _fallback_claims_from_text(text: str) -> list[dict]:
    """Create minimal fallback claim candidates from raw text when model extraction yields nothing."""
    chunks = [part.strip() for part in re.split(r"(?<=[\.!?])\s+|\n+", text) if part and part.strip()]
    candidates = []
    for sentence in chunks:
        if len(sentence.split()) < 6:
            continue
        if is_boilerplate_claim(sentence):
            continue
        candidates.append({"sentence": sentence[:450], "confidence": 0.55})
        if len(candidates) >= 2:
            break
    return candidates


def _run_pipeline_for_text(
    text: str,
    image_bytes: Optional[bytes] = None,
    source_type: str = "text",
    source_url: Optional[str] = None,
    source_title: Optional[str] = None,
    source_extension: Optional[str] = None,
    source_name: Optional[str] = None,
):
    """Run the core claim extraction + evidence + verification pipeline.
    
    Returns list of ExtractedClaim dicts (not yet Pydantic objects).
    """
    raw_claims = extract_checkworthy_claims(text, threshold=settings.CLAIM_CONFIDENCE_THRESHOLD)
    if not raw_claims and source_type in {"web", "video"}:
        raw_claims = _fallback_claims_from_text(text)
        if raw_claims:
            logger.info("Using fallback claim generation (%s candidate(s)) for %s input.", len(raw_claims), source_type)
    
    claims_data = []
    
    for rc in raw_claims:
        claim_text = rc["sentence"]
        confidence = rc["confidence"]
        claim_type = classify_claim_type(claim_text)

        if not is_claim_analyst_worthy(claim_text):
            # Keep borderline claims for URL/video sources when extractor found very few options.
            # This prevents title-only fallback text from always producing empty results.
            should_keep_borderline = (
                source_type in {"web", "video"}
                and len(raw_claims) <= 2
                and len(claim_text.split()) >= 6
            )
            if not should_keep_borderline:
                logger.info("Discarding low-fact claim: %s", claim_text[:120])
                continue
            logger.info("Keeping borderline URL-derived claim: %s", claim_text[:120])
        
        # Retrieve Evidence
        query = build_retrieval_query(claim_text)
        evidence_list = retrieve_evidence(query, top_k=5)
        evidence_list = filter_evidence(evidence_list)
        
        # Verify + lightweight XAI features
        evidence_results = []
        best_verdict = "NEUTRAL"
        best_verdict_conf = 0.0
        best_evidence_score = 0.0
        overlap_vocab = set()
        retrieval_scores = []
        has_supporting = False
        has_refuting = False
        evidence_sources = []
        
        for ev in evidence_list:
            v_res = verify_claim(claim_text, ev["text"])
            normalized_verdict = normalize_verdict_label(v_res["verdict"])
            matched_terms = highlight_overlap(claim_text, ev["text"])
            retrieval_score = float(ev.get("score") or 0.0)
            nli_confidence = float(v_res.get("confidence") or 0.0)
            quality_score = max(0.0, min(1.0, retrieval_score)) * max(0.0, min(1.0, nli_confidence))
            highlight_text = extract_evidence_highlight(ev["text"], matched_terms)
            overlap_vocab.update(matched_terms)
            retrieval_scores.append(retrieval_score)
            
            page_source = ev.get("page") or "Unknown"
            evidence_sources.append(page_source)
            
            evidence_results.append(
                EvidenceResult(
                    text=ev["text"],
                    score=retrieval_score,
                    source=page_source,
                    matched_terms=matched_terms,
                    verdict=normalized_verdict,
                    confidence=nli_confidence,
                    quality_score=quality_score,
                    highlight_text=highlight_text,
                )
            )

            if normalized_verdict == "SUPPORTS":
                has_supporting = True
            elif normalized_verdict == "REFUTES":
                has_refuting = True

            if nli_confidence > best_verdict_conf:
                best_verdict_conf = nli_confidence
            if quality_score > best_evidence_score:
                best_evidence_score = quality_score

        evidence_results.sort(
            key=lambda item: float(item.quality_score or 0.0),
            reverse=True,
        )

        if has_supporting:
            best_verdict = "SUPPORTS"
        elif has_refuting:
            best_verdict = "REFUTES"
                
        # Build provenance graph
        provenance_nodes = [
            {"id": "claim", "type": "claim", "text": claim_text}
        ]
        provenance_edges = []
        for i, ev in enumerate(evidence_results):
            node_id = f"e{i}"
            provenance_nodes.append(
                {
                    "id": node_id,
                    "type": "evidence",
                    "text": ev.text,
                    "source": ev.source,
                    "score": ev.score,
                }
            )
            provenance_edges.append(
                {
                    "from": "claim",
                    "to": node_id,
                    "weight": ev.score,
                }
            )

        highlights = [{"text": claim_text, "type": "claim"}] + [
            {"text": term, "type": "evidence"}
            for term in sorted(overlap_vocab)[:12]
        ]

        avg_retrieval = sum(retrieval_scores) / len(retrieval_scores) if retrieval_scores else 0.0

        # Generate external evidence links
        ext_evidence_data = generate_external_evidence(claim_text, evidence_sources)
        external_evidence = ExternalEvidence(
            web_sources=[WebSource(**ws) for ws in ext_evidence_data["web_sources"]],
            video_sources=[VideoSource(**vs) for vs in ext_evidence_data["video_sources"]],
        )

        # Compute visual context if image is provided
        visual_context = None
        if image_bytes:
            clip_score = compute_image_text_similarity(image_bytes, claim_text)
            ocr_text = extract_text_from_image(image_bytes)
            visual_context = VisualContext(
                ocr_text=ocr_text,
                image_text_similarity=clip_score,
                used_in_verification=bool(ocr_text),
            )

        claims_data.append({
            "claim_text": claim_text,
            "confidence": confidence,
            "claim_type": claim_type,
            "verdict": best_verdict,
            "evidence_results": evidence_results,
            "provenance_nodes": provenance_nodes,
            "provenance_edges": provenance_edges,
            "highlights": highlights,
            "avg_retrieval": avg_retrieval,
            "best_evidence_score": best_evidence_score,
            "external_evidence": external_evidence,
            "visual_context": visual_context,
            "input_source": {
                "source_type": source_type,
                "source_url": source_url,
                "source_title": source_title,
                "source_extension": source_extension,
                "source_name": source_name,
            }
        })
    
    return claims_data


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
    
    # Normalize optional text input so image-only requests don't fail validation.
    normalized_text = (text or "").strip()

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
        ocr_text = extract_text_from_image(image_bytes)
        logger.info(f"OCR extracted text: {ocr_text[:200] if ocr_text else '(none)'}")
    
    # Merge OCR text with input text
    analysis_text = normalized_text
    if ocr_text:
        analysis_text = f"{analysis_text} {ocr_text}".strip()
    
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
            source_type=source_type, 
            source_url=source_url, 
            source_title=source_title,
            source_extension=source_extension,
            source_name=source_name,
        )
    else:
        augmented_data = None
    
    # Build final claims
    claims_with_evidence = []
    
    # Use augmented data if available, otherwise text-only
    primary_data = augmented_data if augmented_data else text_only_data
    
    for i, cd in enumerate(primary_data):
        # Compute multimodal contribution if both pipelines ran
        multimodal_contribution = None
        if augmented_data and i < len(text_only_data):
            text_verdict = text_only_data[i]["verdict"]
            image_verdict = cd["verdict"]
            
            if image_verdict != text_verdict:
                impact = "positive" if image_verdict == "SUPPORTS" else "negative"
            else:
                impact = "none"
            
            multimodal_contribution = MultimodalContribution(
                text_only_verdict=text_verdict,
                with_image_verdict=image_verdict,
                image_impact=impact,
            )
        elif image_bytes:
            # Image provided but no different claims found — still show contribution
            multimodal_contribution = MultimodalContribution(
                text_only_verdict=cd["verdict"],
                with_image_verdict=cd["verdict"],
                image_impact="none",
            )

        claims_with_evidence.append(
            ExtractedClaim(
                id=str(uuid4()),
                text=cd["claim_text"],
                confidence=cd["confidence"],
                claim_type=cd["claim_type"],
                verdict=cd["verdict"],
                evidence=cd["evidence_results"],
                provenance={
                    "nodes": cd["provenance_nodes"],
                    "edges": cd["provenance_edges"],
                },
                explainability={
                    "highlights": cd["highlights"],
                    "confidence_details": {
                        "model_confidence": cd["confidence"],
                        "best_evidence_score": cd["best_evidence_score"],
                        "avg_retrieval_score": cd["avg_retrieval"],
                    }
                },
                visual_context=cd.get("visual_context"),
                multimodal_contribution=multimodal_contribution,
                external_evidence=cd["external_evidence"],
                input_source=cd.get("input_source")
            )
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
