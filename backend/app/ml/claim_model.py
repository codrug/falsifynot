"""Claim extraction model wrapper."""

from pathlib import Path
from typing import Tuple

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from app.core import get_logger

logger = get_logger(__name__)


class ClaimModel:
    """Inference wrapper around a sequence classification model for claim extraction."""

    def __init__(self, model_path: Path | str):
        self.model_path = Path(model_path)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        if not self.model_path.exists():
            raise FileNotFoundError(f"Model path does not exist: {self.model_path}")

        logger.info(f"Loading claim model from {self.model_path}...")
        self.tokenizer = AutoTokenizer.from_pretrained(str(self.model_path))
        self.model = AutoModelForSequenceClassification.from_pretrained(str(self.model_path))
        self.model.to(self.device)
        self.model.eval()

    def predict_batch(self, sentences: list) -> list:
        """
        Predict multiple sentences in a single batch.
        
        Args:
            sentences: List of strings
            
        Returns:
            list: List of (label, confidence) tuples
        """
        if not sentences:
            return []
            
        try:
            inputs = self.tokenizer(
                sentences,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=256
            ).to(self.device)

            with torch.no_grad():
                outputs = self.model(**inputs)

            probs = torch.softmax(outputs.logits, dim=1)
            preds = torch.argmax(probs, dim=1).cpu().numpy()
            confs = probs.max(dim=1).values.cpu().numpy()

            return [(int(p), float(c)) for p, c in zip(preds, confs)]
        except Exception as e:
            logger.error(f"Error during batch claim prediction: {e}")
            return [(0, 0.0)] * len(sentences)

    def predict(self, sentence: str) -> Tuple[int, float]:
        """Predict if a sentence is check-worthy."""
        results = self.predict_batch([sentence])
        return results[0]
