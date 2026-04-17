"""Analysis service for claim extraction and verification."""

import logging
import re
from typing import Dict, List, Optional, Any
from uuid import uuid4

from app.core import settings
from app.models.schemas import (
    ExtractedClaim, EvidenceResult, VisualContext, MultimodalContribution,
    ExternalEvidence, WebSource, VideoSource, InputSourceInfo, Provenance,
    ProvenanceNode, ProvenanceEdge,
)
from app.ml.pipeline import extract_checkworthy_claims, retrieve_evidence
from app.ml.verifier import verify_claim
from app.ml.ocr_service import extract_text_from_image
from app.ml.clip_service import compute_image_text_similarity
from app.ml.link_service import generate_external_evidence
from app.ml.multimodal_verifier import verify_claim_multimodal, apply_multimodal_override, extract_claims_from_image

logger = logging.getLogger(__name__)


class AnalysisService:
    """Service for analyzing text and images for fact-checking."""

    @staticmethod
    def extract_claims_from_text(
        text: str,
        image_bytes: Optional[bytes] = None,
        ocr_text: Optional[str] = None,
        source_type: str = "text",
        source_url: Optional[str] = None,
        source_title: Optional[str] = None,
        source_extension: Optional[str] = None,
        source_name: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Extract and verify claims from text with optional image context."""
        # Extract claims
        raw_claims = extract_checkworthy_claims(text, threshold=settings.CLAIM_CONFIDENCE_THRESHOLD)
        if not raw_claims and source_type in {"web", "video"}:
            raw_claims = AnalysisService._fallback_claims_from_text(text)
            if raw_claims:
                logger.info("Using fallback claim generation (%s candidate(s)) for %s input.", len(raw_claims), source_type)

        if not raw_claims and image_bytes:
            raw_claims = extract_claims_from_image(image_bytes, ocr_text)
            if raw_claims:
                logger.info("Using LLaVA fallback claim extraction (%s candidate(s)) for image-only input.", len(raw_claims))

        
        claim_candidates = []
        top_n_claims = max(1, int(settings.CLAIM_TOP_N))

        for rc in raw_claims:
            claim_text = rc["sentence"]
            model_confidence = float(rc.get("confidence") or 0.0)

            if not AnalysisService._is_valid_claim(claim_text):
                logger.warning(
                    "Potential wrong classification: invalid claim passed extractor | confidence=%.4f | source=%s | claim=%s",
                    model_confidence,
                    source_type,
                    claim_text[:160],
                )
                continue

            boosted_confidence = min(1.0, model_confidence + AnalysisService._factual_score(claim_text))
            if not AnalysisService._has_factual_signal(claim_text):
                boosted_confidence = max(0.0, boosted_confidence - settings.NON_FACTUAL_CONFIDENCE_PENALTY)

            if boosted_confidence < settings.CLAIM_CONFIDENCE_THRESHOLD:
                logger.info(
                    "Skipping low-confidence claim before retrieval | model_conf=%.4f | boosted_conf=%.4f | threshold=%.2f | source=%s | claim=%s",
                    model_confidence,
                    boosted_confidence,
                    settings.CLAIM_CONFIDENCE_THRESHOLD,
                    source_type,
                    claim_text[:160],
                )
                continue

            if not AnalysisService._is_claim_analyst_worthy(claim_text):
                logger.warning(
                    "Potential wrong classification: extractor accepted low-fact claim | confidence=%.4f | source=%s | claim=%s",
                    model_confidence,
                    source_type,
                    claim_text[:160],
                )
                should_keep_borderline = (
                    source_type in {"web", "video"}
                    and len(raw_claims) <= 2
                    and len(claim_text.split()) >= 6
                )
                if not should_keep_borderline:
                    logger.info("Discarding low-fact claim: %s", claim_text[:120])
                    continue
                logger.info("Keeping borderline URL-derived claim: %s", claim_text[:120])

            claim_candidates.append(
                {
                    "claim_text": claim_text,
                    "model_confidence": model_confidence,
                    "confidence": boosted_confidence,
                    "claim_type": AnalysisService._classify_claim_type(claim_text),
                }
            )

        claim_candidates.sort(key=lambda item: float(item.get("confidence") or 0.0), reverse=True)
        if len(claim_candidates) > top_n_claims:
            logger.info(
                "Keeping top-%s claims for retrieval (from %s candidates) | source=%s",
                top_n_claims,
                len(claim_candidates),
                source_type,
            )
        selected_claims = claim_candidates[:top_n_claims]

        claims_data = []

        for selected in selected_claims:
            claim_text = selected["claim_text"]
            confidence = selected["confidence"]
            claim_type = selected["claim_type"]

            # Retrieve Evidence
            query = AnalysisService._build_retrieval_query(claim_text)
            evidence_list = retrieve_evidence(query, top_k=settings.RETRIEVAL_TOP_K)
            evidence_list = AnalysisService._filter_evidence(evidence_list)

            if not evidence_list:
                logger.warning(
                    "No evidence found for claim | source=%s | top_k=%s | claim=%s",
                    source_type,
                    settings.RETRIEVAL_TOP_K,
                    claim_text[:160],
                )
            else:
                max_retrieval_score = max(float(ev.get("score") or 0.0) for ev in evidence_list)
                if max_retrieval_score < settings.LOW_SIMILARITY_WARNING_THRESHOLD:
                    logger.warning(
                        "Low similarity retrieval for claim | max_score=%.4f | source=%s | claim=%s",
                        max_retrieval_score,
                        source_type,
                        claim_text[:160],
                    )

            # Verify + lightweight XAI features
            evidence_results, best_verdict, best_verdict_conf, best_evidence_score, overlap_vocab, retrieval_scores, evidence_sources, support_mass, refute_mass, neutral_mass = AnalysisService._verify_claim_with_evidence(
                claim_text, evidence_list, source_type
            )

            if evidence_list and best_verdict == "NEUTRAL" and best_verdict_conf < settings.LOW_VERDICT_CONFIDENCE_WARNING_THRESHOLD:
                logger.warning(
                    "Wrong classification risk: no confident verdict despite retrieved evidence | best_conf=%.4f | source=%s | claim=%s",
                    best_verdict_conf,
                    source_type,
                    claim_text[:160],
                )

            # Multimodal verification (if image provided)
            multimodal_contribution = None
            if image_bytes and settings.MULTIMODAL_ENABLED:
                try:
                    logger.info("Running multimodal verification for claim: %s", claim_text[:100])
                    mm_result = verify_claim_multimodal(claim_text, image_bytes)

                    # Apply multimodal override logic
                    override_result = apply_multimodal_override(best_verdict, mm_result)

                    # Update verdict if multimodal changes it
                    if override_result['verdict'] != best_verdict:
                        logger.info("Multimodal override: %s -> %s (reason: %s)",
                                  best_verdict, override_result['verdict'], override_result['reasoning'])
                        best_verdict = override_result['verdict']
                        best_verdict_conf = override_result['confidence']

                    # Create multimodal contribution record
                    multimodal_contribution = MultimodalContribution(
                        text_only_verdict=override_result.get('original_verdict', best_verdict),
                        with_image_verdict=best_verdict,
                        image_impact=override_result.get('impact', 'none'),
                        multimodal_reasoning=mm_result.get('reasoning', ''),
                        image_caption=mm_result.get('caption', '')
                    )

                except Exception as e:
                    logger.error("Multimodal verification failed: %s", e)
                    multimodal_contribution = None

            # Build provenance graph
            provenance = AnalysisService._build_provenance_graph(claim_text, evidence_results)

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
                "provenance": provenance,
                "highlights": highlights,
                "avg_retrieval": avg_retrieval,
                "best_evidence_score": best_evidence_score,
                "external_evidence": external_evidence,
                "visual_context": visual_context,
                "multimodal_contribution": multimodal_contribution,
                "input_source": {
                    "source_type": source_type,
                    "source_url": source_url,
                    "source_title": source_title,
                    "source_extension": source_extension,
                    "source_name": source_name,
                }
            })

        return claims_data

    @staticmethod
    def _fallback_claims_from_text(text: str) -> List[Dict[str, Any]]:
        """Create minimal fallback claim candidates from raw text when model extraction yields nothing."""
        import re
        chunks = [part.strip() for part in re.split(r"(?<=[\.!?])\s+|\n+", text) if part and part.strip()]
        candidates = []
        for sentence in chunks:
            if len(sentence.split()) < 6:
                continue
            if AnalysisService._is_boilerplate_claim(sentence):
                continue
            candidates.append({"sentence": sentence[:450], "confidence": 0.55})
            if len(candidates) >= 2:
                break
        return candidates

    @staticmethod
    def _is_valid_claim(text: str) -> bool:
        normalized = " ".join((text or "").lower().split())
        if len(normalized.split()) < 6:
            return False
        # Strict opinion markers. Avoid blanket-rejecting modals like "should" because OCR headlines
        # often use quote-based political language (e.g., "X should resign ...") that is still
        # check-worthy in context.
        if any(
            phrase in normalized
            for phrase in ("i think", "i believe", "in my opinion", "we need to")
        ):
            return False

        # If the claim contains "should", only reject when it's likely generic advice with no
        # "news-like" signal (numbers/years or recognizable named entities).
        if re.search(r"\bshould\b", normalized):
            has_context = (
                AnalysisService._has_numeric_signal(text)
                or bool(re.search(r"\b(19|20)\d{2}\b", text or ""))
                or bool(re.search(r"\b[A-Z][a-z]{2,}\b", text or ""))
            )
            if not has_context:
                return False
        if any(word in normalized for word in ("thing", "something", "stuff")):
            return False
        return True

    @staticmethod
    def _factual_score(text: str) -> float:
        score = 0.0
        lower_text = (text or "").lower()
        if any(char.isdigit() for char in text):
            score += 0.2
        if any(word in lower_text for word in settings.FACTUAL_BOOST_MARKERS):
            score += 0.2
        return score

    @staticmethod
    def _has_factual_signal(text: str) -> bool:
        lower_text = (text or "").lower()
        return any(char.isdigit() for char in text) or any(
            word in lower_text for word in ("percent", "million", "billion", "increased", "decreased")
        )

    @staticmethod
    def _is_claim_analyst_worthy(claim: str) -> bool:
        if AnalysisService._is_boilerplate_claim(claim):
            return False
        return AnalysisService._has_numeric_signal(claim) or AnalysisService._has_factual_structure(claim)

    @staticmethod
    def _is_boilerplate_claim(text: str) -> bool:
        normalized = " ".join(text.lower().split())
        if not normalized:
            return True
        if len(normalized.split()) <= 5 and not AnalysisService._has_numeric_signal(text):
            return True
        if any(pattern in normalized for pattern in settings.BOILERPLATE_PATTERNS):
            return True
        if normalized.startswith(("read more", "click here", "watch now", "share this")):
            return True
        return False

    @staticmethod
    def _has_numeric_signal(text: str) -> bool:
        import re
        return bool(re.search(r"\b\d+(?:\.\d+)?(?:%|\s?(?:million|billion|trillion|k|km|kg|cm|mm|m|years?|months?|days?|c|f))?\b", text.lower()))

    @staticmethod
    def _has_factual_structure(text: str) -> bool:
        lower_text = f" {text.lower().strip()} "
        has_assertion = any(marker in lower_text for marker in settings.ASSERTION_MARKERS)
        has_entity_like_token = bool(re.search(r"\b[A-Z][a-z]{2,}\b", text))
        has_year = bool(re.search(r"\b(19|20)\d{2}\b", text))
        return has_assertion and (has_entity_like_token or has_year)

    @staticmethod
    def _classify_claim_type(claim: str) -> str:
        lower_claim = claim.lower()

        if AnalysisService._has_numeric_signal(claim):
            return "Statistical"
        if any(marker in lower_claim for marker in settings.CAUSAL_MARKERS):
            return "Causal"
        if any(marker in lower_claim for marker in settings.OPINION_MARKERS):
            return "Opinion"
        if AnalysisService._has_factual_structure(claim):
            return "Causal"
        return "Opinion"

    @staticmethod
    def _build_retrieval_query(claim: str) -> str:
        import re
        simplified = AnalysisService._simplify_claim(claim)
        tokens = [token for token in re.findall(r"[a-z0-9']+", simplified.lower()) if token not in {
            "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "is", "it",
            "its", "of", "on", "or", "that", "the", "to", "was", "were", "will", "with", "this", "these", "those",
        } and len(token) > 2]
        important_terms = tokens[:8]
        if important_terms:
            return f"{simplified} {' '.join(important_terms)}"
        return simplified

    @staticmethod
    def _simplify_claim(claim: str) -> str:
        simplified = claim.strip()
        lower_claim = simplified.lower()
        for prefix in settings.RETRIEVAL_PREFIXES:
            if lower_claim.startswith(prefix):
                simplified = simplified[len(prefix):].strip(" ,.:;-")
                break
        return simplified

    @staticmethod
    def _filter_evidence(evidence_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        filtered = []
        for item in evidence_list:
            text = str(item.get("text", "")).lower()
            if any(keyword in text for keyword in settings.BAD_EVIDENCE_KEYWORDS):
                continue
            filtered.append(item)
        return filtered

    @staticmethod
    def _verify_claim_with_evidence(claim_text: str, evidence_list: List[Dict[str, Any]], source_type: str):
        """Verify claim against evidence and return results."""
        evidence_results = []
        best_verdict = "NEUTRAL"
        best_verdict_conf = 0.0
        best_evidence_score = 0.0
        overlap_vocab = set()
        retrieval_scores = []
        evidence_sources = []
        support_mass = 0.0
        refute_mass = 0.0
        neutral_mass = 0.0

        for ev in evidence_list:
            v_res = verify_claim(claim_text, ev["text"])
            normalized_verdict = AnalysisService._normalize_verdict_label(v_res["verdict"])
            support_prob = float(v_res.get("support_score") or 0.0)
            refute_prob = float(v_res.get("refute_score") or 0.0)
            neutral_prob = float(v_res.get("neutral_score") or 0.0)
            matched_terms = AnalysisService._highlight_overlap(claim_text, ev["text"])
            retrieval_score = float(ev.get("score") or 0.0)
            nli_confidence = float(v_res.get("confidence") or 0.0)
            quality_score = max(0.0, min(1.0, retrieval_score)) * max(0.0, min(1.0, nli_confidence))
            highlight_text = AnalysisService._extract_evidence_highlight(ev["text"], matched_terms)
            overlap_vocab.update(matched_terms)
            retrieval_scores.append(retrieval_score)
            support_mass += retrieval_score * support_prob
            refute_mass += retrieval_score * refute_prob
            neutral_mass += retrieval_score * neutral_prob

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

            if nli_confidence > best_verdict_conf:
                best_verdict_conf = nli_confidence
            if quality_score > best_evidence_score:
                best_evidence_score = quality_score

        evidence_results.sort(
            key=lambda item: float(item.quality_score or 0.0),
            reverse=True,
        )

        aggregate_threshold = 0.15
        if support_mass > refute_mass and support_mass >= max(neutral_mass, aggregate_threshold):
            best_verdict = "SUPPORTS"
        elif refute_mass > support_mass and refute_mass >= max(neutral_mass, aggregate_threshold):
            best_verdict = "REFUTES"
        else:
            best_verdict = "NEUTRAL"

        return evidence_results, best_verdict, best_verdict_conf, best_evidence_score, overlap_vocab, retrieval_scores, evidence_sources, support_mass, refute_mass, neutral_mass

    @staticmethod
    def _normalize_verdict_label(label: str) -> str:
        normalized = (label or "").strip().upper()
        if normalized in {"ENTAILMENT", "SUPPORTS", "SUPPORTED"}:
            return "SUPPORTS"
        if normalized in {"CONTRADICTION", "REFUTES", "REFUTED"}:
            return "REFUTES"
        return "NEUTRAL"

    @staticmethod
    def _highlight_overlap(claim: str, evidence: str) -> List[str]:
        import re
        claim_words = set(re.findall(r"[a-z0-9']+", claim.lower())) - {
            "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "is", "it",
            "its", "of", "on", "or", "that", "the", "to", "was", "were", "will", "with", "this", "these", "those",
        }
        evidence_words = set(re.findall(r"[a-z0-9']+", evidence.lower())) - {
            "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "is", "it",
            "its", "of", "on", "or", "that", "the", "to", "was", "were", "will", "with", "this", "these", "those",
        }
        overlap = claim_words.intersection(evidence_words)
        return sorted(overlap)

    @staticmethod
    def _extract_evidence_highlight(evidence_text: str, matched_terms: List[str]) -> str:
        import re
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

    @staticmethod
    def _build_provenance_graph(claim_text: str, evidence_results: List[EvidenceResult]) -> Provenance:
        """Build provenance graph showing evidence relationships."""
        provenance_nodes = [
            ProvenanceNode(
                id="claim",
                type="claim",
                text=claim_text,
                label="Claim"
            )
        ]
        provenance_edges = []

        for i, ev in enumerate(evidence_results):
            node_id = f"e{i}"
            provenance_nodes.append(
                ProvenanceNode(
                    id=node_id,
                    type="evidence",
                    text=ev.text,
                    source=ev.source,
                    score=ev.score,
                    label=f"Evidence {i+1}"
                )
            )
            provenance_edges.append(
                ProvenanceEdge(**{"from": "claim", "to": node_id, "weight": ev.score})
            )

        return Provenance(nodes=provenance_nodes, edges=provenance_edges)

    @staticmethod
    def build_extracted_claims(
        claims_data: List[Dict[str, Any]],
        text_only_data: Optional[List[Dict[str, Any]]] = None,
        image_bytes: Optional[bytes] = None,
    ) -> List[ExtractedClaim]:
        """Build ExtractedClaim objects from claims data."""
        claims_with_evidence = []

        for cd in claims_data:
            multimodal_contribution = None
            if text_only_data and image_bytes:
                # Match by claim text instead of index
                matching_text_claim = next(
                    (tc for tc in text_only_data if tc["claim_text"] == cd["claim_text"]),
                    None
                )
                if matching_text_claim:
                    text_verdict = matching_text_claim["verdict"]
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
                else:
                    # No matching text claim found
                    multimodal_contribution = MultimodalContribution(
                        text_only_verdict=cd["verdict"],
                        with_image_verdict=cd["verdict"],
                        image_impact="none",
                    )
            elif image_bytes:
                # Image provided but no text comparison
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
                    provenance=cd["provenance"],
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

        return claims_with_evidence