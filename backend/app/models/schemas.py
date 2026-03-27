from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field


class EvidenceResult(BaseModel):
    """Evidence document retrieved for a claim."""
    
    text: str = Field(..., description="Text of the evidence document")
    score: float = Field(..., description="Relevance score")
    source: Optional[str] = Field(None, description="Evidence source page/title")
    matched_terms: List[str] = Field(default_factory=list, description="Lexical overlap terms with the claim")
    verdict: Optional[str] = Field(None, description="Verdict from NLI model")
    confidence: Optional[float] = Field(None, description="Confidence in the verdict")
    quality_score: Optional[float] = Field(None, description="Combined evidence quality score")
    highlight_text: Optional[str] = Field(None, description="Most relevant evidence snippet/phrase")


class ProvenanceNode(BaseModel):
    """A node in the provenance graph."""
    id: str
    label: str
    type: str  # e.g., "source", "process", "evidence"
    metadata: Optional[Dict[str, Any]] = None


class ProvenanceEdge(BaseModel):
    """An edge in the provenance graph."""
    source: str
    target: str
    label: Optional[str] = None


class TextHighlight(BaseModel):
    """A highlighted snippet of text for explainability."""
    text: str
    type: str  # e.g., "claim", "evidence", "contradiction"


class ExplainabilityData(BaseModel):
    """AI explainability and diagnostic data."""
    highlights: List[TextHighlight] = Field(default_factory=list)
    confidence_details: Optional[Dict[str, float]] = None


class ExtractedClaim(BaseModel):
    """A single extracted claim from user input."""

    id: str = Field(..., description="Unique claim identifier")
    text: str = Field(..., description="The claim text")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Extraction confidence (0-1)")
    claim_type: Optional[str] = Field(None, description="Claim type: Statistical, Causal, Opinion")
    verdict: Optional[str] = Field(None, description="Analysis verdict")
    evidence: List[EvidenceResult] = Field(default_factory=list, description="Retrieved evidence")
    provenance: Optional[Dict[str, Any]] = Field(None, description="Provenance graph data")
    explainability: Optional[ExplainabilityData] = Field(None, description="Explainability data")


class AnalyzeRequest(BaseModel):
    """Request model for dynamic claim extraction."""

    text: str = Field(..., min_length=1, description="Raw input text to analyze")


class AnalyzeResponse(BaseModel):
    """Response model for claim extraction and evidence retrieval output."""

    claims: List[ExtractedClaim] = Field(..., description="Extracted claims with evidence")
