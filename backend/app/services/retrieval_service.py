"""Retrieval service using SentenceTransformer embeddings."""

import torch
import pandas as pd
from pathlib import Path
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
from torch.nn.functional import cosine_similarity
from app.core import get_logger

logger = get_logger(__name__)


class RetrievalService:
    """Semantic search over embedded corpus using SentenceTransformer."""
    
    def __init__(
        self,
        embeddings_path: str = "models/retrieval/wiki_embeddings.pt",
        corpus_path: str = "models/retrieval/wiki_retrieval_sample.csv",
        model_name: str = "all-MiniLM-L6-v2",
        top_k: int = 5,
        device: Optional[str] = None
    ):
        """Initialize retrieval service with precomputed embeddings and corpus.
        
        Args:
            embeddings_path: Path to precomputed corpus embeddings (torch tensor).
            corpus_path: Path to CSV corpus with 'Text' column.
            model_name: SentenceTransformer model name for query encoding.
            top_k: Number of top results to return per query.
            device: Device to use ('cuda', 'cpu'). Auto-detects if None.
        """
        self.top_k = top_k
        self.embeddings_path = embeddings_path
        self.corpus_path = corpus_path
        
        # Set device
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        
        # Load corpus
        self._load_corpus()
        
        # Load embeddings
        self._load_embeddings()
        
        # Load embedder model
        self._load_model(model_name)
    
    def _load_corpus(self):
        """Load corpus from CSV file."""
        corpus_path = Path(self.corpus_path)
        
        if not corpus_path.exists():
            self.corpus = []
            return
        
        try:
            corpus_df = pd.read_csv(corpus_path)
            self.corpus = corpus_df["Text"].tolist() if "Text" in corpus_df.columns else []
        except Exception as e:
            logger.error(f"Failed to load corpus: {e}")
            self.corpus = []
    
    def _load_embeddings(self):
        """Load precomputed embeddings from PyTorch tensor."""
        embeddings_path = Path(self.embeddings_path)
        
        if not embeddings_path.exists():
            self.corpus_embeddings = None
            return
        
        try:
            self.corpus_embeddings = torch.load(
                embeddings_path,
                map_location=self.device
            )
        except Exception as e:
            logger.error(f"Failed to load embeddings: {e}")
            self.corpus_embeddings = None
    
    def _load_model(self, model_name: str):
        """Load SentenceTransformer model for query encoding."""
        try:
            self.embedder = SentenceTransformer(model_name, device=self.device)
        except Exception as e:
            logger.error(f"Failed to load SentenceTransformer: {e}")
            self.embedder = None
    
    def retrieve_evidence(
        self,
        claim: str,
        top_k: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve top-k evidence documents for a claim.
        
        Args:
            claim: The claim/query text.
            top_k: Override default top_k. If None, uses instance top_k.
            
        Returns:
            List of dicts with 'text' and 'score' keys, sorted by score descending.
        """
        if not claim or not self.embedder or self.corpus_embeddings is None or not self.corpus:
            return []
        
        k = top_k or self.top_k
        k = min(k, len(self.corpus))
        
        try:
            # Encode query
            claim_embedding = self.embedder.encode(
                claim,
                convert_to_tensor=True,
                device=self.device
            )
            
            # Compute cosine similarity
            similarities = cosine_similarity(
                claim_embedding.unsqueeze(0),
                self.corpus_embeddings
            )
            
            # Get top-k results
            top_results = torch.topk(similarities.squeeze(), k=k)
            
            results = []
            for score, idx in zip(top_results.values, top_results.indices):
                idx_int = int(idx.item())
                score_float = float(score.item())
                results.append({
                    "text": self.corpus[idx_int],
                    "score": score_float
                })
            
            return results
        
        except Exception as e:
            logger.error(f"Error during retrieval: {e}")
            return []
