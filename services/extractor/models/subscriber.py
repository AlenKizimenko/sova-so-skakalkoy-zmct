from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from .base import Base


class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey(
        "events.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), nullable=False)
    name = Column(String(255))
    registered_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("event_id", "email",
                         name="uq_subscriber_event_email"),
    )
