import faiss
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

import os
from pathlib import Path

# Resolve paths correctly relative to this file's directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
INDEX_FILE = str(BASE_DIR / "data" / "wiki_faiss.index")
METADATA_CSV_FILE = str(BASE_DIR / "data" / "wiki_corpus_metadata.csv")
METADATA_PARQUET_FILE = str(BASE_DIR / "data" / "wiki_corpus_metadata.parquet")

index = None
metadata = None
model = None
model_loaded = False


def load_retriever():
    global index, metadata, model, model_loaded

    if model_loaded:
        return True

    try:
        print("Loading FAISS index...")
        if not os.path.exists(INDEX_FILE):
            print(f"[ERROR] Missing index file: {INDEX_FILE}")
            return
        index = faiss.read_index(INDEX_FILE)

        print("Loading metadata...")
        if not os.path.exists(METADATA_PARQUET_FILE):
            if not os.path.exists(METADATA_CSV_FILE):
                print(f"[ERROR] Missing metadata source file: {METADATA_CSV_FILE}")
                return

            print("Building metadata Parquet file from CSV...")
            csv_df = pd.read_csv(METADATA_CSV_FILE)
            csv_df.to_parquet(METADATA_PARQUET_FILE, engine="fastparquet")

        metadata = pd.read_parquet(METADATA_PARQUET_FILE, engine="fastparquet")

        print("Loading embedding model...")
        model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

        model_loaded = True
        print("Retriever ready.")
    except Exception as e:
        model_loaded = False
        print(f"[ERROR] Failed to initialize retriever: {e}")


def retrieve(query, top_k=5):
    if not model_loaded:
        load_retriever()
        
    if not model_loaded or index is None or metadata is None or model is None:
        raise RuntimeError("Retriever not loaded. Ensure index, metadata, and model are available.")

    query_embedding = model.encode(
        [query],
        convert_to_numpy=True,
        normalize_embeddings=True
    )
    query_embedding = np.asarray(query_embedding, dtype=np.float32)

    search_k = min(top_k, index.ntotal)
    scores, indices = index.search(query_embedding, search_k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0 or idx >= len(metadata):
            continue

        row = metadata.iloc[idx]
        page_title = row["page"] if "page" in row else ""
        # Combine page title + sentence
        combined_text = f"[{page_title}] {row['text']}" if page_title else row["text"]
        
        results.append({
            "score": float(score),
            "text": combined_text,
            "page": page_title
        })

    return results


# load_retriever()