"""Typed API schemas for claim extraction pipeline."""

from typing import List, Optional

from pydantic import BaseModel, Field


class EvidenceResult(BaseModel):
    """Evidence document retrieved for a claim."""
    
    text: str = Field(..., description="Text of the evidence document")
    score: float = Field(..., ge=0.0, le=1.0, description="Relevance score (0-1)")


class ExtractedClaim(BaseModel):
    """A single extracted claim from user input."""

    id: str = Field(..., description="Unique claim identifier")
    text: str = Field(..., description="The claim text")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Extraction confidence (0-1)")
    verdict: Optional[str] = Field(None, description="Analysis verdict")
    evidence: List[EvidenceResult] = Field(default_factory=list, description="Retrieved evidence")


class AnalyzeRequest(BaseModel):
    """Request model for dynamic claim extraction."""

    text: str = Field(..., min_length=1, description="Raw input text to analyze")


class AnalyzeResponse(BaseModel):
    """Response model for claim extraction and evidence retrieval output."""

    claims: List[ExtractedClaim] = Field(..., description="Extracted claims with evidence")
