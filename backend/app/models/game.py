from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Game(BaseModel):
    """Game model representing a single game/product"""
    __tablename__ = "games"
    
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    firebase_project_id = Column(String, nullable=True)
    description = Column(String, nullable=True)
    
    # Relationships
    environments = relationship("Environment", back_populates="game", cascade="all, delete-orphan")
    configs = relationship("Config", back_populates="game", cascade="all, delete-orphan")
    experiments = relationship("Experiment", back_populates="game", cascade="all, delete-orphan")
