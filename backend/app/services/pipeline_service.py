"""Verification pipeline orchestration service."""

from app.models.schemas import AnalyzeResponse


class VerificationPipeline:
    """Extensible orchestration pipeline for analysis modules."""

    def __init__(self, claim_service, retrieval_service=None, fusion_service=None):
        self.claim_service = claim_service
        self.retrieval_service = retrieval_service
        self.fusion_service = fusion_service

    def run(self, text: str) -> AnalyzeResponse:
        """Run currently available pipeline stages."""
        claims = self.claim_service.extract_claims(text)
        return AnalyzeResponse(claims=claims)
