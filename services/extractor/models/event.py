from sqlalchemy import Column, String, Text, TIMESTAMP, Integer, Boolean, DECIMAL, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from .base import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expert_id = Column(UUID(as_uuid=True), ForeignKey(
        "experts.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    raw_text = Column(Text)
    date = Column(TIMESTAMP)
    duration_minutes = Column(Integer)
    location_raw = Column(String(500))
    location_resolved = Column(String(500))
    is_online = Column(Boolean, default=False, nullable=False)
    price_amount = Column(DECIMAL(10, 2))
    price_currency = Column(String(3), default="RUB")
    price_for_members = Column(DECIMAL(10, 2))
    status = Column(String(50), default="draft", nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now())
