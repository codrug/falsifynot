"""Service layer for claim extraction orchestration."""

from typing import List
from uuid import uuid4

from app.ml.claim_model import ClaimModel
from app.ml.text_loader import split_into_sentences
from app.models.schemas import ExtractedClaim


class ClaimExtractionService:
    """Extract claim-bearing sentences from raw text."""

    def __init__(self, claim_model: ClaimModel, confidence_threshold: float = 0.5):
        self.claim_model = claim_model
        self.confidence_threshold = confidence_threshold

    def extract_claims(self, text: str) -> List[ExtractedClaim]:
        """Run sentence-level claim extraction and confidence filtering."""
        sentences = split_into_sentences(text)
        if not sentences:
            return []

        # Batch prediction
        results = self.claim_model.predict_batch(sentences)
        
        extracted: List[ExtractedClaim] = []
        for sentence, (label, confidence) in zip(sentences, results):
            if label == 1 and confidence >= self.confidence_threshold:
                extracted.append(
                    ExtractedClaim(
                        id=str(uuid4()),
                        text=sentence,
                        confidence=confidence,
                    )
                )

        if not extracted and text.strip():
            extracted.append(
                ExtractedClaim(
                    id=str(uuid4()),
                    text=text.strip(),
                    confidence=0.0,
                )
            )

        return extracted
