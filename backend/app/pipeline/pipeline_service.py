from typing import Optional, List
from app.models.schemas import AnalyzeResponse, ExtractedClaim, EvidenceResult
from app.services.claim_service import ClaimExtractionService
from app.services.retrieval_service import RetrievalService
from app.services.verification_service import VerificationService
from app.core import get_logger

logger = get_logger(__name__)


class VerificationPipeline:
    """Unified orchestration pipeline: Claims → Evidence → Verification."""

    def __init__(
        self,
        claim_service: ClaimExtractionService,
        retrieval_service: Optional[RetrievalService] = None,
        verification_service: Optional[VerificationService] = None,
    ):
        """Initialize pipeline with required services.
        
        Args:
            claim_service: Service for extracting claims from text.
            retrieval_service: Service for retrieving evidence (optional).
            verification_service: Service for verifying claims against evidence (optional).
        """
        self.claim_service = claim_service
        self.retrieval_service = retrieval_service
        self.verification_service = verification_service

    def run(self, text: str) -> AnalyzeResponse:
        """Run unified pipeline: extract claims → retrieve evidence → verify.
        
        Args:
            text: Input text to analyze.
            
        Returns:
            AnalyzeResponse with claims and evidence.
        """
        # Step 1: Extract claims
        extracted_claims = self.claim_service.extract_claims(text)
        
        # Step 2: Retrieve evidence for each claim
        claims_with_evidence = []
        for claim in extracted_claims:
            claim_data = ExtractedClaim(
                id=claim.id,
                text=claim.text,
                confidence=claim.confidence,
                verdict="NEUTRAL",
                evidence=[]
            )
            
            if self.retrieval_service:
                try:
                    evidence_list = self.retrieval_service.retrieve_evidence(claim.text)
                    for ev in evidence_list:
                        claim_data.evidence.append(
                            EvidenceResult(text=ev["text"], score=ev["score"])
                        )
                except Exception as e:
                    logger.error(f"Error retrieving evidence: {e}")
            
            claims_with_evidence.append(claim_data)

        # Step 3: Batch verify all claim-evidence pairs
        if self.verification_service:
            all_pairs = []
            pair_mapping = [] # to map flat results back to claims

            for i, claim_data in enumerate(claims_with_evidence):
                for j, ev in enumerate(claim_data.evidence):
                    all_pairs.append((claim_data.text, ev.text))
                    pair_mapping.append((i, j))

            if all_pairs:
                try:
                    verification_results = self.verification_service.verify_batch(all_pairs)
                    
                    # Group results by claim to aggregate
                    claim_verdicts = {} # index -> list of results

                    for idx, result in enumerate(verification_results):
                        claim_idx, ev_idx = pair_mapping[idx]
                        
                        # Update evidence result with verdict
                        claims_with_evidence[claim_idx].evidence[ev_idx].verdict = result["verdict"]
                        claims_with_evidence[claim_idx].evidence[ev_idx].confidence = result["confidence"]
                        
                        if claim_idx not in claim_verdicts:
                            claim_verdicts[claim_idx] = []
                        claim_verdicts[claim_idx].append(result)

                    # Update claim verdict based on best evidence
                    for claim_idx, results in claim_verdicts.items():
                        if results:
                            best_verdict = max(results, key=lambda x: x["confidence"])
                            claims_with_evidence[claim_idx].verdict = best_verdict["verdict"]

                except Exception as e:
                    logger.error(f"Error in batch verification: {e}")
        
        return AnalyzeResponse(claims=claims_with_evidence)
