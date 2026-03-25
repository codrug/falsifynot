"""
NLI-based fact verification module
Uses MoritzLaurer/deberta-v3-base-mnli-fever-anli for claim verification
"""

import torch
from transformers import pipeline

nli = None
model_loaded = False

def load_verifier():
    """Load the NLI model for fact verification."""
    global nli, model_loaded
    
    if model_loaded:
        return True

    try:
        print("Loading NLI verification model...")
        nli = pipeline(
            "text-classification",
            model="MoritzLaurer/deberta-v3-base-mnli-fever-anli",
            device=0 if torch.cuda.is_available() else -1  # GPU if available, else CPU
        )
        model_loaded = True
        print("[OK] Verifier ready.\n")
    except Exception as e:
        model_loaded = False
        print(f"[ERROR] Failed to load NLI model: {e}\n")


def verify_batch(pairs):
    """
    Verify multiple (claim, evidence) pairs in a single batch.
    
    Args:
        pairs (list): List of (claim, evidence_text) tuples
        
    Returns:
        list: List of dicts with verdicts and confidence scores
    """
    if not model_loaded:
        load_verifier()
        
    if not model_loaded or nli is None or not pairs:
        return [{"verdict": "UNKNOWN", "confidence": 0.0}] * len(pairs)
    
    try:
        # Format: premise is the evidence, hypothesis is the claim
        texts = [f"premise: {ev} hypothesis: {cl}" for cl, ev in pairs]
        
        # Use batch processing
        batch_results = nli(texts, batch_size=8)
        
        return [
            {
                "verdict": res["label"].upper(),
                "confidence": res["score"]
            }
            for res in batch_results
        ]
    except Exception as e:
        print(f"[ERROR] Batch verification error: {e}")
        return [{"verdict": "ERROR", "confidence": 0.0}] * len(pairs)


def verify_claim(claim, evidence_text):
    """
    Verify a claim against evidence using NLI.
    """
    results = verify_batch([(claim, evidence_text)])
    return results[0]


# Load model on import
# load_verifier()
