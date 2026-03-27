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


# --- Multimodal Models ---

class VisualContext(BaseModel):
    """Visual context extracted from an uploaded image."""
    ocr_text: str = Field("", description="Text extracted from image via OCR")
    image_text_similarity: float = Field(0.0, description="CLIP similarity score between image and claim (0-1)")
    used_in_verification: bool = Field(False, description="Whether image context was used in the verification pipeline")


class MultimodalContribution(BaseModel):
    """Comparison of text-only vs multimodal verification results."""
    text_only_verdict: str = Field("NEUTRAL", description="Verdict using text-only pipeline")
    with_image_verdict: str = Field("NEUTRAL", description="Verdict using text + image context")
    image_impact: str = Field("none", description="Impact of image: 'positive', 'negative', 'none'")


class WebSource(BaseModel):
    """An external web source link."""
    title: str = Field(..., description="Display title for the link")
    url: str = Field(..., description="Full URL")


class VideoSource(BaseModel):
    """An external video source link."""
    title: str = Field(..., description="Display title for the video link")
    url: str = Field(..., description="Full URL (YouTube search, etc.)")


class ExternalEvidence(BaseModel):
    """External evidence links (web and video sources)."""
    web_sources: List[WebSource] = Field(default_factory=list, description="Wikipedia and web source links")
    video_sources: List[VideoSource] = Field(default_factory=list, description="YouTube and video source links")


# --- Core Models ---

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
    # Multimodal fields
    visual_context: Optional[VisualContext] = Field(None, description="Visual context from uploaded image")
    multimodal_contribution: Optional[MultimodalContribution] = Field(None, description="Multimodal vs text-only comparison")
    external_evidence: Optional[ExternalEvidence] = Field(None, description="External web and video links")


class AnalyzeRequest(BaseModel):
    """Request model for dynamic claim extraction (text-only fallback)."""

    text: str = Field(..., min_length=1, description="Raw input text to analyze")


class AnalyzeResponse(BaseModel):
    """Response model for claim extraction and evidence retrieval output."""

    claims: List[ExtractedClaim] = Field(..., description="Extracted claims with evidence")
