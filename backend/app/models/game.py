from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Game(Base):
    """Game model representing a single game/product"""
    __tablename__ = "games"
    
    # Use app_id as primary key instead of auto-generated UUID
    app_id = Column(String, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    
    # Timestamps (from BaseModel pattern)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    section_configs = relationship("SectionConfig", back_populates="game", cascade="all, delete-orphan")
    
    # Assigned operators (game operators who can access this game)
    assigned_operators = relationship(
        "User",
        secondary="user_game_assignments",
        back_populates="assigned_games"
    )