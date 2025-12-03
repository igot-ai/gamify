from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Game(BaseModel):
    """Game model representing a single game/product"""
    __tablename__ = "games"
    
    app_id = Column(String, unique=True, nullable=False, index=True)  # User-defined App ID
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    
    # Relationships
    section_configs = relationship("SectionConfig", back_populates="game", cascade="all, delete-orphan")
