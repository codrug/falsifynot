"""Claim extraction service (Sprint 2)."""

from typing import List, Dict, Any

class ClaimExtractor:
    """Service for extracting claims from text."""
    
    def __init__(self):
        # Load models here later
        pass

    async def extract_claims(self, text: str) -> List[Dict[str, Any]]:
        """Extract claims from input text.
        
        Args:
            text: Input text to analyze.
            
        Returns:
            List of extracted claims with metadata.
        """
        # Mock logic for now - in Sprint 2 replace with DistilBERT
        if len(text) < 50:
            return [{"text": text, "confidence": 0.95}]
            
        # Split by sentences for simple mock extraction
        import re
        sentences = re.split(r'(?<=[.!?])\s+', text)
        claims = [
            {"text": s, "confidence": 0.85} 
            for s in sentences if len(s) > 20
        ]
        
        if not claims:
             claims = [{"text": text[:100] + "...", "confidence": 0.7}]
             
        return claims
