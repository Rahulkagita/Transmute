import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Transformation(Base):
    __tablename__ = "transformations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="completed")
    source_text = Column(Text, nullable=True)
    context = Column(Text, nullable=True)
    canonical_content = Column(JSON, nullable=False)
    settings = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    deliverables = relationship("Deliverable", back_populates="transformation", cascade="all, delete-orphan")
