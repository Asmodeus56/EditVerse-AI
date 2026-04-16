# backend/app/db/models.py

from sqlalchemy import Column, Integer, String, DateTime, func, Float, Text
from backend.app.db.database import Base # Base is imported here
from sqlalchemy.dialects.postgresql import UUID
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Relationship (Optional: Link jobs to users)
    # jobs = relationship("VideoJob", back_populates="owner")

class VideoJob(Base):
    __tablename__ = 'video_jobs'

    # (Keep your existing __init__ fix here)
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer) # Placeholder
    prompt = Column(String, nullable=False)
    original_file_path = Column(String, nullable=False)

    edited_file_path = Column(String, nullable=True)

    status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=func.now())

    duration = Column(Float, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    fps = Column(Float, nullable=True)
    codec = Column(String, nullable=True)
    error_message = Column(Text, nullable=True) # Good for debugging failures
    ai_reply = Column(Text, nullable=True)
