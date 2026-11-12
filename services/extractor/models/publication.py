from sqlalchemy import Column, String, Text, TIMESTAMP, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from .base import Base


class Publication(Base):
    __tablename__ = "publications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey(
        "events.id", ondelete="CASCADE"), nullable=False)
    channel = Column(String(50), nullable=False)
    status = Column(String(50), default="pending", nullable=False)
    external_url = Column(String(500))
    sent_count = Column(Integer, default=0)
    error_message = Column(Text)
    published_at = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, server_default=func.now())
