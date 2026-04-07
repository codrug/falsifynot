"""Source model."""

from sqlalchemy import Column, String, Float, Text
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base


class Source(Base):
    """Source database model for credibility tracking."""
    
    id = Column(String, primary_key=True, default=lambda: f"src_{uuid.uuid4().hex[:8]}")
    domain = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)
    credibility_score = Column(Float, default=0.5)  # 0.0 to 1.0
    bias_rating = Column(String, nullable=True)  # left, center, right, etc.
    description = Column(Text, nullable=True)
    
    # Relationships
    evidence = relationship("Evidence", back_populates="source")
