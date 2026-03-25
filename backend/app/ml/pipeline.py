from app.ml.text_loader import load_input, split_into_sentences
import app.ml.claim_inference as claim_inference
import app.ml.retriever as retriever_module
import app.ml.verifier as verifier_module

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
        print(f"[ERROR] File not found: {e}")
        return []
    except ValueError as e:
        print(f"[ERROR] Error: {e}")
        return []
    except Exception as e:
        print(f"[ERROR] Unexpected error loading input: {e}")
        return []
    
    if not text or not text.strip():
        print("[ERROR] Input text is empty.")
        return []
    
    sentences = split_into_sentences(text)
    
    if not sentences:
        print("[ERROR] No sentences found in input.")
        return []
    
    print(f"\nProcessing {len(sentences)} sentences...\n")
    
    results = []
    for i, sentence in enumerate(sentences, 1):
        try:
            pred, conf = claim_inference.predict_claim(sentence)
            if pred == 1 and conf >= threshold:
                results.append({
                    "sentence": sentence,
                    "confidence": conf
                })
                print(f"[{i}/{len(sentences)}] [OK] Check-worthy ({conf:.4f}): {sentence[:80]}...")
            else:
                print(f"[{i}/{len(sentences)}] [NO] Not check-worthy ({conf:.4f}): {sentence[:80]}...")
        except Exception as e:
            print(f"[{i}/{len(sentences)}] Error processing sentence: {e}")
            continue
    
    return results

def retrieve_evidence(claim, top_k=5):
    """Retrieve evidence for a claim from the corpus.
    
    Args:
        claim (str): The claim to find evidence for
        top_k (int): Number of evidence sentences to retrieve
    Returns:
        list: List of evidence with similarity scores
    """
    if not retriever_module.model_loaded:
        retriever_module.load_retriever()

    if not retriever_module.model_loaded:
        print("[ERROR] Retrieval system not loaded.")
        return []
    
    try:
        evidence = retriever_module.retrieve(claim, top_k=top_k)
        return evidence
    except Exception as e:
        print(f"[ERROR] Error retrieving evidence: {e}")
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
        
        print(f"\n[OK] Results saved to {filename}")
    except Exception as e:
        print(f"[ERROR] Error saving results: {e}")

if __name__ == "__main__":
    print("=" * 70)
    print("Claim Detection & Evidence Retrieval & Verification Pipeline")
    print("=" * 70)
    
    if not claim_inference.model_loaded:
        print("[ERROR] Claim detection model failed to load. Cannot proceed.")
        exit(1)
    
    if not retriever_module.model_loaded:
        print("[WARN] Warning: Retrieval system not available. Evidence retrieval will be skipped.")
    
    if not verifier_module.model_loaded:
        print("[WARN] Warning: Verification system not available. NLI verification will be skipped.")
    
    try:
        input_data = input("\nEnter text or file path (e.g., 'text.txt', 'text.pdf', or raw text):\n> ").strip()
        
        if not input_data:
            print("[ERROR] No input provided.")
            exit(1)
        
        threshold = 0.8
        print(f"\nUsing confidence threshold: {threshold}")
        
        claims = extract_checkworthy_claims(input_data, threshold=threshold)
        
        print("\n" + "=" * 70)
        print(f"Results: Found {len(claims)} check-worthy claim(s)")
        print("=" * 70)
        
        if claims:
            # Retrieve evidence for all claims
            for c in claims:
                if retriever_module.model_loaded:
                    c['evidence'] = retrieve_evidence(c['sentence'], top_k=5)
            
            # Display results
            for idx, c in enumerate(claims, 1):
                print(f"\n{'='*70}")
                print(f"[Claim {idx}]")
                print(f"Text: {c['sentence']}")
                print(f"Confidence: {c['confidence']:.4f}")
                
                if retriever_module.model_loaded and 'evidence' in c:
                    evidence = c['evidence']
                    if evidence and verifier_module.model_loaded:
                        print(f"\n[Evidence & Verification - Top {len(evidence)}]")
                        for evi_idx, evi in enumerate(evidence, 1):
                            print(f"\n  {evi_idx}. [Similarity: {evi['score']:.4f}]")
                            print(f"     {evi['text'][:300]}...")
                            
                            # Verify claim against this evidence
                            verdict_result = verifier_module.verify_claim(c['sentence'], evi['text'])
                            print(f"     Verdict: {verdict_result['verdict']} (Confidence: {verdict_result['confidence']:.2f})")
                    elif evidence:
                        print(f"\n[Evidence - Top {len(evidence)}]")
                        for evi_idx, evi in enumerate(evidence, 1):
                            print(f"\n  {evi_idx}. [Similarity: {evi['score']:.4f}]")
                            print(f"     {evi['text'][:300]}...")
                    else:
                        print("\n[No evidence found]")
            
            # Offer to save results
            '''try:
                save = input("\n\nSave results to file? (y/n): ").strip().lower()
            except EOFError:
                save = 'n'
            if save == 'y':
                filename = input("Enter filename (default: results.txt): ").strip() or "results.txt"
                save_results_to_file(claims, filename)'''
        else:
            print("\nNo check-worthy claims found.")
            
    except KeyboardInterrupt:
        print("\n\nExecution cancelled by user.")
    except Exception as e:
        print(f"[ERROR] Fatal error: {e}")