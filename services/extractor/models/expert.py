from sqlalchemy import Column, String, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from .base import Base


class Expert(Base):
    __tablename__ = "experts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    bio = Column(Text)
    avatar_url = Column(String(500))
    vk_group_id = Column(String(100))
    vk_access_token = Column(Text)
    smtp_host = Column(String(255))
    smtp_user = Column(String(255))
    smtp_password = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now())
