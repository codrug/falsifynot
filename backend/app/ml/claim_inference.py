import torch
import os
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification

BASE_DIR = Path(__file__).resolve().parent.parent.parent
# Model configuration
MODEL_PATH = BASE_DIR / "models" / "claim_extractor"
LEGACY_MODEL_PATH = BASE_DIR / "models" / "claim_extractor_v2" / "claim_detector_model"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Initialize model and tokenizer
tokenizer = None
model = None
model_loaded = False

def load_model():
    """Load the claim detector model and tokenizer."""
    global tokenizer, model, model_loaded
    
    if model_loaded:
        return True
    
    try:
        resolved_model_path = MODEL_PATH if MODEL_PATH.exists() else LEGACY_MODEL_PATH
        if not resolved_model_path.exists():
            raise FileNotFoundError(f"Model path does not exist: {MODEL_PATH}")
        
        print(f"Loading model from {resolved_model_path}...")
        tokenizer = AutoTokenizer.from_pretrained(str(resolved_model_path))
        model = AutoModelForSequenceClassification.from_pretrained(str(resolved_model_path))
        model.to(device)
        model.eval()
        model_loaded = True
        print(f"[OK] Model loaded successfully on device: {device}")
        return True
    except Exception as e:
        print(f"[ERROR] Error loading model: {e}")
        model_loaded = False
        return False

# Load model on import
# load_model()

def predict_claim(sentence):
    """Predict if a sentence is check-worthy.
    
    Args:
        sentence (str): Input sentence to classify
        
    Returns:
        tuple: (prediction, confidence) where prediction is 1 (check-worthy) or 0 (not check-worthy)
    """
    if not model_loaded:
        load_model()
        
    if not model_loaded:
        raise RuntimeError("Model not loaded. Please ensure the model path is correct.")
    
    if not sentence or not sentence.strip():
        return 0, 0.0
    
    try:
        inputs = tokenizer(
            sentence,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=256
        ).to(device)

        if "token_type_ids" in inputs:
            del inputs["token_type_ids"]

        with torch.no_grad():
            outputs = model(**inputs)

        probs = torch.softmax(outputs.logits, dim=1)
        pred = torch.argmax(probs, dim=1).item()
        conf = probs[0][pred].item()

        return pred, conf  # 1 = check-worthy, 0 = not
    except Exception as e:
        print(f"Error during prediction: {e}")
        return 0, 0.0