import faiss
import numpy as np
import pandas as pd
from pathlib import Path
import re
from typing import List, Dict, Any, Optional
import torch
from sentence_transformers import SentenceTransformer
from app.core import get_logger

logger = get_logger(__name__)


OPINION_MARKERS = (
    "i think",
    "i believe",
    "in my opinion",
    "i feel",
    "maybe",
    "probably",
)

VAGUE_MARKERS = (
    "something",
    "some people",
    "many people",
    "a lot",
    "things",
)


def extract_keywords(text: str) -> List[str]:
    words = re.findall(r"\b\w+\b", text.lower())
    return [w for w in words if len(w) > 3]


def _is_low_quality_claim(claim: str) -> bool:
    normalized = " ".join(claim.lower().split())
    if len(normalized.split()) < 5:
        return True
    if any(marker in normalized for marker in OPINION_MARKERS):
        return True
    if any(marker in normalized for marker in VAGUE_MARKERS):
        return True
    return False


def _keyword_overlap_score(keywords: List[str], text: str) -> float:
    if not keywords:
        return 0.0
    lower_text = text.lower()
    matched = sum(1 for k in keywords if k in lower_text)
    return matched / len(keywords)


class RetrievalService:
    """Semantic search over FAISS index with SentenceTransformer embeddings."""
    
    def __init__(
        self,
        index_path: str = "data/wiki_faiss.index",
        metadata_path: str = "data/wiki_corpus_metadata.csv",
        model_name: str = "BAAI/bge-small-en-v1.5",
        top_k: int = 20,
        similarity_threshold: float = 0.35,
        device: Optional[str] = None
    ):
        """Initialize retrieval service with FAISS index and metadata.
        
        Args:
            index_path: Path to FAISS index file.
            metadata_path: Path to CSV metadata file.
            model_name: SentenceTransformer model name for query encoding.
            top_k: Number of top results to return per query.
            similarity_threshold: Minimum embedding similarity for candidates.
            device: Device to use ('cuda', 'cpu'). Auto-detects if None.
        """
        self.top_k = top_k
        self.similarity_threshold = similarity_threshold
        self.index_path = index_path
        self.metadata_path = metadata_path
        
        # Set device
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        
        # Load retriever components
        self._load_retriever(model_name)
    
    def _load_retriever(self, model_name: str):
        """Load FAISS index, metadata, and embedder model."""
        try:
            index_path = Path(self.index_path)
            if not index_path.is_absolute():
                index_path = (Path(__file__).resolve().parents[2] / index_path).resolve()
            
            if not index_path.exists():
                logger.error(f"Missing index file: {index_path}")
                self.index = None
            else:
                logger.info(f"Loading FAISS index from {index_path}...")
                self.index = faiss.read_index(str(index_path))

            metadata_path = Path(self.metadata_path)
            if not metadata_path.is_absolute():
                metadata_path = (Path(__file__).resolve().parents[2] / metadata_path).resolve()

            if not metadata_path.exists():
                logger.error(f"Missing metadata file: {metadata_path}")
                self.metadata = None
            else:
                logger.info(f"Loading metadata from {metadata_path}...")
                self.metadata = pd.read_csv(metadata_path)

            logger.info(f"Loading embedding model {model_name}...")
            # We use local_files_only=True if we want to ensure it's offline, but 
            # for now let's just load it.
            self.model = SentenceTransformer(model_name, device=self.device)
            
            self.ready = self.index is not None and self.metadata is not None
            if self.ready:
                logger.info("Retrieval Service ready.")
            else:
                logger.warning("Retrieval Service not fully initialized.")
                
        except Exception as e:
            logger.error(f"Failed to initialize retriever: {e}")
            self.index = None
            self.metadata = None
            self.ready = False

    def retrieve_evidence(
        self,
        query: str,
        top_k: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve top-k evidence documents for a claim.
        
        Args:
            query: The claim/query text.
            top_k: Override default top_k. If None, uses instance top_k.
            
        Returns:
            List of dicts with 'text' and 'score' keys, sorted by score descending.
        """
        if not self.ready or not query:
            return []

        if _is_low_quality_claim(query):
            logger.info("Skipping low-quality claim before retrieval: %s", query[:120])
            return []
        
        try:
            requested_k = top_k or self.top_k
            candidate_k = max(requested_k, 20)
            
            # Encode query
            query_embedding = self.model.encode(
                [query],
                convert_to_numpy=True,
                normalize_embeddings=True
            )
            query_embedding = np.asarray(query_embedding, dtype=np.float32)

            search_k = min(candidate_k, self.index.ntotal)
            scores, indices = self.index.search(query_embedding, search_k)

            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx < 0 or idx >= len(self.metadata):
                    continue

                row = self.metadata.iloc[idx]
                page_title = row["page"] if "page" in row else ""
                # Combine page title + sentence
                combined_text = f"[{page_title}] {row['text']}" if page_title else row["text"]
                
                embedding_score = float(score)
                if embedding_score < self.similarity_threshold:
                    continue

                results.append({
                    "embedding_score": embedding_score,
                    "text": combined_text,
                    "page": page_title
                })

            keywords = extract_keywords(query)
            filtered = [
                item for item in results
                if any(k in item["text"].lower() for k in keywords)
            ] if keywords else results

            reranked = []
            for item in filtered:
                keyword_overlap = _keyword_overlap_score(keywords, item["text"])
                hybrid_score = 0.7 * item["embedding_score"] + 0.3 * keyword_overlap
                out = dict(item)
                out["keyword_overlap"] = keyword_overlap
                out["score"] = hybrid_score
                reranked.append(out)

            reranked.sort(key=lambda x: float(x.get("score") or 0.0), reverse=True)
            return reranked[:requested_k]
        
        except Exception as e:
            logger.error(f"Error during retrieval: {e}")
            return []
