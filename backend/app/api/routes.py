"""API route definitions."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict
from datetime import datetime
import uuid

from app.models import ClaimResponse, EvidenceResponse, AnalysisResponse
from app.core import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/v1")


# In-memory storage for demo purposes
claims_store: Dict[str, AnalysisResponse] = {}


class AnalyzeRequest(BaseModel):
    """Request model for claim analysis."""
    
    claim_text: str = Field(..., min_length=1, max_length=1000, description="The claim to analyze")
    include_evidence: bool = Field(default=True, description="Whether to include evidence in response")


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Analyze a new claim",
    description="Submit a claim for fact-checking and receive a complete analysis with evidence."
)
async def analyze_claim(request: AnalyzeRequest) -> AnalysisResponse:
    """
    Analyze a new claim and return structured results.
    
    This endpoint accepts a claim text and returns a comprehensive analysis including:
    - Verdict (true, false, mixed, etc.)
    - Confidence score
    - Supporting/refuting evidence
    - Methodology used
    
    **Note:** This is currently returning mock data for frontend integration.
    """
    logger.info(f"Received analysis request for claim: {request.claim_text[:50]}...")
    
    # Generate unique IDs
    claim_id = f"claim_{uuid.uuid4().hex[:12]}"
    evidence_ids = [f"ev_{uuid.uuid4().hex[:8]}" for _ in range(3)]
    
    # Create mock evidence
    mock_evidence = [
        EvidenceResponse(
            id=evidence_ids[0],
            source="https://www.scientificjournal.com/article-1",
            title="Peer-Reviewed Study on the Topic",
            snippet="Research indicates strong correlation with the stated claim, with 95% confidence interval...",
            relevance_score=0.92,
            credibility_score=0.88,
            stance="supports",
            published_date="2024-01-15"
        ),
        EvidenceResponse(
            id=evidence_ids[1],
            source="https://www.newsoutlet.com/fact-check",
            title="Fact-Check Analysis",
            snippet="Independent verification confirms key aspects of this claim through multiple sources...",
            relevance_score=0.85,
            credibility_score=0.90,
            stance="supports",
            published_date="2024-02-01"
        ),
        EvidenceResponse(
            id=evidence_ids[2],
            source="https://www.alternativeview.org/counter-analysis",
            title="Alternative Perspective",
            snippet="Some experts argue that context is important and the claim may be oversimplified...",
            relevance_score=0.78,
            credibility_score=0.75,
            stance="neutral",
            published_date="2024-01-28"
        )
    ]
    
    # Create mock claim response
    mock_claim = ClaimResponse(
        id=claim_id,
        claim_text=request.claim_text,
        verdict="mostly_true",
        confidence_score=0.85,
        summary="Based on available evidence from credible sources, this claim appears to be largely accurate. "
                "Multiple independent sources corroborate the main points, though some nuance may be missing.",
        created_at=datetime.utcnow()
    )
    
    # Create complete analysis response
    analysis = AnalysisResponse(
        claim=mock_claim,
        evidence=mock_evidence if request.include_evidence else [],
        methodology="Multi-source verification using natural language processing and credibility scoring. "
                   "Sources are ranked by relevance and credibility, with stance detection applied.",
        limitations=[
            "Analysis limited to English-language sources",
            "Real-time events may not be fully represented",
            "Contextual nuances may require human review"
        ]
    )
    
    # Store for later retrieval
    claims_store[claim_id] = analysis
    
    logger.info(f"Analysis completed for claim {claim_id} with verdict: {mock_claim.verdict}")
    
    return analysis


@router.get(
    "/analyze/claim/{claim_id}",
    response_model=AnalysisResponse,
    summary="Retrieve analysis by claim ID",
    description="Fetch a previously analyzed claim by its unique identifier."
)
async def get_claim_analysis(claim_id: str) -> AnalysisResponse:
    """
    Retrieve a previously analyzed claim by ID.
    
    Args:
        claim_id: The unique identifier of the claim
        
    Returns:
        The complete analysis response
        
    Raises:
        HTTPException: 404 if claim not found
    """
    logger.info(f"Retrieving claim analysis for ID: {claim_id}")
    
    if claim_id not in claims_store:
        logger.warning(f"Claim not found: {claim_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Claim with ID '{claim_id}' not found"
        )
    
    return claims_store[claim_id]


@router.get(
    "/health",
    summary="Health check",
    description="Check if the API is running and healthy."
)
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

