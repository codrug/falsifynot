"""Multimedia content model."""

from sqlalchemy import Column, String, ForeignKey, JSON, DateTime, Text
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
import uuid
from datetime import datetime
from app.db.base import Base


class MultimediaContent(Base):
    """Model for storing metadata about uploaded images, audio, or video."""
    
    id = Column(String, primary_key=True, default=lambda: f"media_{uuid.uuid4().hex[:8]}")
    claim_id = Column(String, ForeignKey("claim.id"), nullable=True)
    
    file_type = Column(String, nullable=False)  # image, audio, video
    file_path = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    # Metadata extracted by AI models
    transcript = Column(Text, nullable=True)  # For audio/video
    ocr_text = Column(Text, nullable=True)    # For images
    metadata_json = Column(JSON, nullable=True) # Technical metadata
    
    # Vector embedding (e.g., CLIP 512-dim)
    embedding = Column(Vector(512), nullable=True)
    
    # Relationships
    claim = relationship("Claim", back_populates="multimedia")
