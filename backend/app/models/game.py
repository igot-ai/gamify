from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Game(BaseModel):
    """Game model representing a single game/product"""
    __tablename__ = "games"
    
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    firebase_service_account = Column(JSON, nullable=True)  # Stores the full service account JSON
    description = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    
    # Relationships
    section_configs = relationship("SectionConfig", back_populates="game", cascade="all, delete-orphan")
    
    @property
    def firebase_project_id(self) -> str | None:
        """Extract project_id from the service account JSON for display"""
        if self.firebase_service_account and isinstance(self.firebase_service_account, dict):
            return self.firebase_service_account.get("project_id")
        return None
