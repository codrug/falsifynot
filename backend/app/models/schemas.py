"""Typed API schemas for claim extraction pipeline."""

from typing import List, Optional

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    """Request model for dynamic claim extraction."""

    text: str = Field(..., min_length=1, description="Raw input text to analyze")


class ExtractedClaim(BaseModel):
    """A single extracted claim from user input."""

    id: str
    text: str
    confidence: float
    verdict: Optional[str] = None


class AnalyzeResponse(BaseModel):
    """Response model for claim extraction output."""

    claims: List[ExtractedClaim]
