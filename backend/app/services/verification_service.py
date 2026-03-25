"""
NLI-based fact verification service.
Uses MoritzLaurer/deberta-v3-base-mnli-fever-anli for claim verification.
"""

from typing import Dict, Any, Optional
from transformers import pipeline
from app.core import get_logger

logger = get_logger(__name__)


class VerificationService:
    """Service for verifying claims against evidence using NLI models."""
    
    def __init__(self, model_name: str = "MoritzLaurer/deberta-v3-base-mnli-fever-anli", device: int = 0):
        """Initialize the verification service.
        
        Args:
            model_name: HuggingFace model name for NLI.
            device: Device ID for inference (0 for GPU, -1 for CPU).
        """
        self.model_name = model_name
        self.device = device
        self.nli = None
        self.ready = False
        self._load_model()
    
    def _load_model(self):
        """Load the NLI model for fact verification."""
        try:
            logger.info(f"Loading NLI verification model {self.model_name}...")
            self.nli = pipeline(
                "text-classification",
                model=self.model_name,
                device=self.device
            )
            self.ready = True
            logger.info("Verification Service ready.")
        except Exception as e:
            logger.error(f"Failed to load NLI model: {e}")
            self.ready = False

    def verify_batch(self, pairs: list) -> list:
        """
        Verify multiple (claim, evidence) pairs in a single batch.
        
        Args:
            pairs: List of (claim, evidence_text) tuples.
            
        Returns:
            list: List of dicts with verdicts and confidence scores.
        """
        if not self.ready or self.nli is None or not pairs:
            return [{"verdict": "UNKNOWN", "confidence": 0.0}] * len(pairs)
        
        try:
            texts = [f"premise: {ev} hypothesis: {cl}" for cl, ev in pairs]
            batch_results = self.nli(texts, batch_size=8)
            
            return [
                {
                    "verdict": res["label"].upper(),
                    "confidence": res["score"]
                }
                for res in batch_results
            ]
        except Exception as e:
            logger.error(f"Batch verification error: {e}")
            return [{"verdict": "ERROR", "confidence": 0.0}] * len(pairs)

    def verify_claim(self, claim: str, evidence_text: str) -> Dict[str, Any]:
        """
        Verify a claim against evidence using NLI.
        """
        results = self.verify_batch([(claim, evidence_text)])
        return results[0]
