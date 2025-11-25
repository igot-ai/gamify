from sqlalchemy import Column, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Environment(BaseModel):
    """Environment model (production, staging, development)"""
    __tablename__ = "environments"
    
    name = Column(String, nullable=False)  # production, staging, development
    game_id = Column(String, ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    game = relationship("Game", back_populates="environments")
    configs = relationship("Config", back_populates="environment")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('game_id', 'name', name='uq_game_environment'),
    )
