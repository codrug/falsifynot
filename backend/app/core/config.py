"""Application configuration."""

from pydantic_settings import BaseSettings
from typing import List, Union
from pydantic import field_validator, model_validator


class Settings(BaseSettings):
    """Application settings."""
    
    # API Settings
    APP_NAME: str = "FalsifyNot API"
    APP_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # CORS Settings - will be parsed from comma-separated string
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Database Settings
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/falsifynot"
    
    # Logging Settings
    LOG_LEVEL: str = "INFO"

    # ML Settings - Claim Extraction
    CLAIM_MODEL_PATH: str = "models/claim_extractor"
    CLAIM_CONFIDENCE_THRESHOLD: float = 0.8
    CLAIM_TOP_N: int = 3
    
    # ML Settings - Retrieval
    RETRIEVAL_INDEX_PATH: str = "data/wiki_faiss.index"
    RETRIEVAL_METADATA_PATH: str = "data/wiki_corpus_metadata.csv"
    RETRIEVAL_MODEL_NAME: str = "BAAI/bge-small-en-v1.5"
    RETRIEVAL_TOP_K: int = 20
    RETRIEVAL_DEVICE: str = "auto"  # "auto", "cuda", or "cpu"

    # ML Settings - Verification
    VERIFIER_MODEL_NAME: str = "MoritzLaurer/deberta-v3-base-mnli-fever-anli"
    
    # ML Settings - Ollama and Multimodal
    OLLAMA_ENABLED: bool = True
    OLLAMA_HOST: str = "http://localhost"
    OLLAMA_PORT: int = 11434
    OLLAMA_MODEL: str = "llava:7b"  # LLaVA model name in Ollama
    OLLAMA_TIMEOUT: int = 300  # seconds
    
    # Multimodal Settings
    MULTIMODAL_ENABLED: bool = True
    MULTIMODAL_MAX_IMAGE_SIZE: int = 1024  # max dimension for images
    MULTIMODAL_IMAGE_FORMATS: List[str] = ["jpg", "jpeg", "png", "webp", "gif"]
    MULTIMODAL_VERIFY_WITH_IMAGES: bool = True  # Use images for claim verification
    MULTIMODAL_CONFIDENCE_THRESHOLD: float = 0.7
    MULTIMODAL_DEVICE: str = "auto"  # "auto", "cuda", or "cpu"
    
    # Pipeline Thresholds
    LOW_SIMILARITY_WARNING_THRESHOLD: float = 0.45
    LOW_VERDICT_CONFIDENCE_WARNING_THRESHOLD: float = 0.45
    SIMILARITY_THRESHOLD: float = 0.35
    NON_FACTUAL_CONFIDENCE_PENALTY: float = 0.1
    FACTUAL_BOOST_MARKERS: List[str] = ["percent", "increase", "million", "billion"]
    BAD_EVIDENCE_KEYWORDS: List[str] = ["disambiguation", "may refer to", "genus"]
    OPINION_MARKERS: List[str] = ["i think", "i believe", "in my opinion", "we must", "we should", "i feel", "probably", "maybe"]
    VAGUE_MARKERS: List[str] = ["something", "some people", "many people", "a lot", "things"]
    CAUSAL_MARKERS: List[str] = ["caused", "causes", "cause", "leads to", "led to", "results in", "resulted in", "because", "due to", "driven by", "impact", "affect"]
    ASSERTION_MARKERS: List[str] = [" is ", " are ", " was ", " were ", " has ", " have ", " had "]
    BOILERPLATE_PATTERNS: List[str] = ["all rights reserved", "sign in", "sign up", "log in", "already a registered user", "continue to engage", "subscribe", "cookie policy", "privacy policy", "terms of service", "download app"]
    RETRIEVAL_PREFIXES: List[str] = ["studies show that", "study shows that", "research shows that", "it is claimed that", "according to experts"]
    
    @model_validator(mode="after")
    def parse_cors_origins(self):
        """Parse CORS_ORIGINS if it's a string."""
        if isinstance(self.CORS_ORIGINS, str):
            self.CORS_ORIGINS = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return self
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
