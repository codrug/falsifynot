"""Pydantic response models for the API."""

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class EvidenceResponse(BaseModel):
    """Model for evidence supporting or refuting a claim."""
    
    id: str = Field(..., description="Unique identifier for the evidence")
    source: str = Field(..., description="Source of the evidence (URL, publication, etc.)")
    title: str = Field(..., description="Title of the evidence source")
    snippet: str = Field(..., description="Relevant excerpt from the source")
    relevance_score: float = Field(..., ge=0.0, le=1.0, description="Relevance score (0-1)")
    credibility_score: float = Field(..., ge=0.0, le=1.0, description="Credibility score (0-1)")
    stance: str = Field(..., description="Evidence stance: 'supports', 'refutes', or 'neutral'")
    published_date: Optional[str] = Field(None, description="Publication date of the source")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "ev_123456",
                "source": "https://www.example.com/article",
                "title": "Research Study on Climate Change",
                "snippet": "Recent data shows a significant trend...",
                "relevance_score": 0.85,
                "credibility_score": 0.92,
                "stance": "supports",
                "published_date": "2024-01-15"
            }
        }


class ClaimResponse(BaseModel):
    """Model for claim analysis response."""
    
    id: str = Field(..., description="Unique identifier for the claim")
    claim_text: str = Field(..., description="The original claim text")
    verdict: str = Field(
        ..., 
        description="Analysis verdict: 'true', 'mostly_true', 'mixed', 'mostly_false', 'false', 'unverifiable'"
    )
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence in the verdict (0-1)")
    summary: str = Field(..., description="Brief summary of the analysis")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of analysis")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "claim_789012",
                "claim_text": "The earth is round",
                "verdict": "true",
                "confidence_score": 0.99,
                "summary": "Scientific consensus and evidence overwhelmingly support this claim.",
                "created_at": "2024-02-15T12:00:00Z"
            }
        }


class AnalysisResponse(BaseModel):
    """Complete analysis response including claim and evidence."""
    
    claim: ClaimResponse = Field(..., description="The analyzed claim")
    evidence: List[EvidenceResponse] = Field(..., description="List of supporting/refuting evidence")
    methodology: str = Field(..., description="Description of analysis methodology used")
    limitations: Optional[List[str]] = Field(
        default_factory=list,
        description="Known limitations of the analysis"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "claim": {
                    "id": "claim_789012",
                    "claim_text": "The earth is round",
                    "verdict": "true",
                    "confidence_score": 0.99,
                    "summary": "Scientific consensus and evidence overwhelmingly support this claim.",
                    "created_at": "2024-02-15T12:00:00Z"
                },
                "evidence": [
                    {
                        "id": "ev_123456",
                        "source": "https://www.nasa.gov",
                        "title": "NASA Earth Observations",
                        "snippet": "Satellite imagery confirms Earth's spherical shape...",
                        "relevance_score": 0.95,
                        "credibility_score": 0.98,
                        "stance": "supports",
                        "published_date": "2024-01-01"
                    }
                ],
                "methodology": "Multi-source verification using credible scientific sources",
                "limitations": ["Analysis limited to English-language sources"]
            }
        }
