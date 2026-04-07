from app.ml.text_loader import load_input, split_into_sentences
import app.ml.claim_inference as claim_inference
import app.ml.retriever as retriever_module
import app.ml.verifier as verifier_module
import re
import logging

from app.core import settings

logger = logging.getLogger(__name__)


def extract_keywords(text):
    words = re.findall(r"\b\w+\b", text.lower())
    return [w for w in words if len(w) > 3]


def _is_low_quality_claim(claim):
    normalized = " ".join(claim.lower().split())
    if len(normalized.split()) < 5:
        return True
    if any(marker in normalized for marker in settings.OPINION_MARKERS):
        return True
    if any(marker in normalized for marker in settings.VAGUE_MARKERS):
        return True
    return False


def _keyword_overlap_score(keywords, text):
    if not keywords:
        return 0.0
    lower_text = text.lower()
    matched = sum(1 for k in keywords if k in lower_text)
    return matched / len(keywords)


def _apply_keyword_filter(claim, retrieved_sentences):
    keywords = extract_keywords(claim)
    if not keywords:
        return retrieved_sentences

    filtered = [
        s for s in retrieved_sentences
        if any(k in str(s.get("text", "")).lower() for k in keywords)
    ]
    return filtered


def extract_checkworthy_claims(input_data, threshold=0.6):
    """Extract check-worthy claims from input text.
    
    Args:
        input_data (str): Text or file path
        threshold (float): Confidence threshold for check-worthy claims (0-1)
        
    Returns:
        list: List of check-worthy claims with confidence scores
    """
    if not claim_inference.model_loaded:
        claim_inference.load_model()
    
    if not claim_inference.model_loaded:
        raise RuntimeError("Model not loaded. Please check the model path.")
    
    try:
        text = load_input(input_data)
    except FileNotFoundError as e:
        logger.error(f"File not found: {e}")
        return []
    except ValueError as e:
        logger.error(f"Error: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error loading input: {e}")
        return []
    
    if not text or not text.strip():
        logger.error("Input text is empty.")
        return []
    
    sentences = split_into_sentences(text)
    
    if not sentences:
        logger.error("No sentences found in input.")
        return []
    
    logger.info(f"Processing {len(sentences)} sentences...")
    
    results = []
    for i, sentence in enumerate(sentences, 1):
        try:
            pred, conf = claim_inference.predict_claim(sentence)
            if pred == 1 and conf >= threshold:
                results.append({
                    "sentence": sentence,
                    "confidence": conf
                })
                logger.info(f"[{i}/{len(sentences)}] Check-worthy ({conf:.4f}): {sentence[:80]}...")
            else:
                logger.debug(f"[{i}/{len(sentences)}] Not check-worthy ({conf:.4f}): {sentence[:80]}...")
        except Exception as e:
            logger.error(f"[{i}/{len(sentences)}] Error processing sentence: {e}")
            continue
    
    return results

def retrieve_evidence(claim, top_k=settings.RETRIEVAL_TOP_K):
    """Retrieve evidence for a claim from the corpus.
    
    Args:
        claim (str): The claim to find evidence for
        top_k (int): Number of evidence sentences to retrieve
    Returns:
        list: List of evidence with similarity scores
    """
    if _is_low_quality_claim(claim):
        logger.info(f"Skipping low-quality claim before retrieval: {claim[:100]}...")
        return []

    if not retriever_module.model_loaded:
        retriever_module.load_retriever()

    if not retriever_module.model_loaded:
        logger.error("Retrieval system not loaded.")
        return []
    
    try:
        # Pull a larger candidate set, then aggressively filter/rerank.
        candidate_k = max(top_k, settings.RETRIEVAL_TOP_K)
        evidence = retriever_module.retrieve(claim, top_k=candidate_k)

        # Keep lower-bound semantic matches (0.3-0.4 range), then filter lexical junk.
        evidence = [ev for ev in evidence if float(ev.get("score") or 0.0) >= settings.SIMILARITY_THRESHOLD]
        evidence = _apply_keyword_filter(claim, evidence)

        keywords = extract_keywords(claim)
        reranked = []
        for ev in evidence:
            embedding_score = float(ev.get("score") or 0.0)
            keyword_overlap = _keyword_overlap_score(keywords, str(ev.get("text", "")))
            hybrid_score = 0.7 * embedding_score + 0.3 * keyword_overlap

            ev_copy = dict(ev)
            ev_copy["embedding_score"] = embedding_score
            ev_copy["keyword_overlap"] = keyword_overlap
            ev_copy["score"] = hybrid_score
            reranked.append(ev_copy)

        reranked.sort(key=lambda item: float(item.get("score") or 0.0), reverse=True)
        return reranked[:top_k]
    except Exception as e:
        logger.error(f"Error retrieving evidence: {e}")
        return []

def save_results_to_file(claims, filename="results.txt"):
    """Save analysis results to a file."""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("=" * 70 + "\n")
            f.write("Claim Detection & Evidence Retrieval Results\n")
            f.write("=" * 70 + "\n\n")
            
            for idx, c in enumerate(claims, 1):
                f.write(f"[Claim {idx}]\n")
                f.write(f"Text: {c['sentence']}\n")
                f.write(f"Confidence: {c['confidence']:.4f}\n\n")
                
                if 'evidence' in c and c['evidence']:
                    f.write(f"Evidence (Top {len(c['evidence'])}):\n")
                    for evi_idx, evi in enumerate(c['evidence'], 1):
                        f.write(f"\n  {evi_idx}. [Similarity: {evi['score']:.4f}]\n")
                        f.write(f"     {evi['text']}\n")
                else:
                    f.write("No supporting evidence found.\n")
                
                f.write("\n" + "=" * 70 + "\n\n")
        
        logger.info(f"Results saved to {filename}")
    except Exception as e:
        logger.error(f"Error saving results: {e}")

