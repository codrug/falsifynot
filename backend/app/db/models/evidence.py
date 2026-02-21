"""Evidence model."""

from sqlalchemy import Column, String, Float, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
import uuid
from app.db.base import Base


class Evidence(Base):
    """Evidence database model."""
    
    id = Column(String, primary_key=True, default=lambda: f"ev_{uuid.uuid4().hex[:8]}")
    claim_id = Column(String, ForeignKey("claim.id"), nullable=False)
    source_id = Column(String, ForeignKey("source.id"), nullable=True)
    
    url = Column(String, nullable=True)
    title = Column(String, nullable=True)
    snippet = Column(Text, nullable=True)
    published_date = Column(Date, nullable=True)
    
    relevance_score = Column(Float, nullable=True)
    credibility_score = Column(Float, nullable=True)
    stance = Column(String, nullable=True)  # supports, refutes, neutral
    
    # Vector embedding (e.g., SBERT 384-dim or 768-dim)
    embedding = Column(Vector(768), nullable=True)
    
    # Relationships
    claim = relationship("Claim", back_populates="evidence")
    source = relationship("Source", back_populates="evidence")
