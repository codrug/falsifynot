"""Analyze API routes."""

from datetime import datetime
import re
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request, status

from app.core import get_logger, settings
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, ExtractedClaim, EvidenceResult

from app.ml.pipeline import extract_checkworthy_claims, retrieve_evidence
from app.ml.verifier import verify_claim

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


def is_claim_analyst_worthy(claim: str) -> bool:
    # High-impact gate: discard low-fact claims with neither numeric nor factual structure.
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


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    """Analyze incoming text and return extracted claims using the new ML scripts."""
    logger.info("Received dynamic analyze request")
    
    # 1. Extract claims
    raw_claims = extract_checkworthy_claims(payload.text, threshold=settings.CLAIM_CONFIDENCE_THRESHOLD)
    
    claims_with_evidence = []
        
    for rc in raw_claims:
        claim_text = rc["sentence"]
        confidence = rc["confidence"]
        claim_type = classify_claim_type(claim_text)

        if not is_claim_analyst_worthy(claim_text):
            logger.info("Discarding low-fact claim: %s", claim_text[:120])
            continue
        
        # 2. Retrieve Evidence
        query = build_retrieval_query(claim_text)
        evidence_list = retrieve_evidence(query, top_k=5)
        evidence_list = filter_evidence(evidence_list)
        
        # 3. Verify + lightweight XAI features
        evidence_results = []
        best_verdict = "NEUTRAL"
        best_verdict_conf = 0.0
        best_evidence_score = 0.0
        overlap_vocab = set()
        retrieval_scores = []
        has_supporting = False
        has_refuting = False
        
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
            evidence_results.append(
                EvidenceResult(
                    text=ev["text"],
                    score=retrieval_score,
                    source=ev.get("page") or "Unknown",
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
                
        # 4. Build provenance graph linking claim to each evidence node.
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

        claims_with_evidence.append(
            ExtractedClaim(
                id=str(uuid4()),
                text=claim_text,
                confidence=confidence,
                claim_type=claim_type,
                verdict=best_verdict,
                evidence=evidence_results,
                provenance={
                    "nodes": provenance_nodes,
                    "edges": provenance_edges,
                },
                explainability={
                    "highlights": highlights,
                    "confidence_details": {
                        "model_confidence": confidence,
                        "best_evidence_score": best_evidence_score,
                        "avg_retrieval_score": avg_retrieval,
                    }
                }
            )
        )
        
    return AnalyzeResponse(claims=claims_with_evidence)


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
    }
