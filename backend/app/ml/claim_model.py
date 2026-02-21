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

        logger.info("Loading claim extraction model from %s", self.model_path)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_path)
        self.model.to(self.device)
        self.model.eval()
        logger.info("Claim extraction model loaded on device: %s", self.device)

    def predict(self, sentence: str) -> Tuple[int, float]:
        """Predict claim label and confidence for a sentence.

        Returns:
            tuple[int, float]: (label, confidence)
        """
        encoded = self.tokenizer(
            sentence,
            truncation=True,
            padding=True,
            return_tensors="pt",
            max_length=512,
        )
        encoded = {key: value.to(self.device) for key, value in encoded.items()}

        with torch.no_grad():
            outputs = self.model(**encoded)
            logits = outputs.logits.squeeze(0)

            if logits.ndim == 0 or logits.shape[0] == 1:
                probability = torch.sigmoid(logits).item()
                label = int(probability >= 0.5)
                confidence = float(probability if label == 1 else 1.0 - probability)
            else:
                probabilities = torch.softmax(logits, dim=-1)
                confidence_tensor, label_tensor = torch.max(probabilities, dim=-1)
                label = int(label_tensor.item())
                confidence = float(confidence_tensor.item())

        return label, confidence
