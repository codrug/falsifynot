"""Verification pipeline orchestration service."""

from typing import Optional
from app.models.schemas import AnalyzeResponse, ExtractedClaim, EvidenceResult
from app.services.claim_service import ClaimExtractionService
from app.services.retrieval_service import RetrievalService
from app.core import get_logger

logger = get_logger(__name__)


class VerificationPipeline:
    """Unified orchestration pipeline: Claims → Evidence."""

    def __init__(
        self,
        claim_service: ClaimExtractionService,
        retrieval_service: Optional[RetrievalService] = None,
        fusion_service = None
    ):
        """Initialize pipeline with required services.
        
        Args:
            claim_service: Service for extracting claims from text.
            retrieval_service: Service for retrieving evidence (optional).
            fusion_service: Service for fusing evidence (optional, future).
        """
        self.claim_service = claim_service
        self.retrieval_service = retrieval_service
        self.fusion_service = fusion_service

    def run(self, text: str) -> AnalyzeResponse:
        """Run unified pipeline: extract claims → retrieve evidence.
        
        Args:
            text: Input text to analyze.
            
        Returns:
            AnalyzeResponse with claims and evidence.
            
        Pipeline flow:
            1. Extract claims from text
            2. For each claim, retrieve evidence (if retrieval service available)
            3. Return structured response
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
                verdict=claim.verdict,
                evidence=[]
            )
            
            # Retrieve evidence if service available
            if self.retrieval_service:
                try:
                    evidence_list = self.retrieval_service.retrieve_evidence(claim.text)
                    claim_data.evidence = [
                        EvidenceResult(text=ev["text"], score=ev["score"])
                        for ev in evidence_list
                    ]
                except Exception as e:
                    logger.error(f"Error retrieving evidence: {e}")
            
            claims_with_evidence.append(claim_data)
        
        return AnalyzeResponse(claims=claims_with_evidence)
