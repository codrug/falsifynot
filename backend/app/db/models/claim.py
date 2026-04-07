"""Claim model."""

from sqlalchemy import Column, String, Float, DateTime, Enum, Text
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base import Base


class Claim(Base):
    """Claim database model."""
    
    id = Column(String, primary_key=True, default=lambda: f"claim_{uuid.uuid4().hex[:12]}")
    claim_text = Column(Text, nullable=False)
    verdict = Column(String, nullable=True)  # true, mostly_true, etc.
    confidence_score = Column(Float, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    evidence = relationship("Evidence", back_populates="claim", cascade="all, delete-orphan")
    multimedia = relationship("MultimediaContent", back_populates="claim")
