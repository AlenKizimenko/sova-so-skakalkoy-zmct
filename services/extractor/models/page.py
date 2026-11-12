from sqlalchemy import Column, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from .base import Base


class Page(Base):
    __tablename__ = "pages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey(
        "events.id", ondelete="CASCADE"), unique=True, nullable=False)
    blocks = Column(JSONB, default=list, nullable=False)
    composer_version = Column(String(20))
    composed_at = Column(TIMESTAMP, server_default=func.now())
