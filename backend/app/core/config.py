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
    LOG_FORMAT: str = "json"  # or "text"

    # ML Settings
    CLAIM_MODEL_PATH: str = "app/ml/claim_extractor_model"
    CLAIM_CONFIDENCE_THRESHOLD: float = 0.5
    
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
