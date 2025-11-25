from enum import Enum
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class ExperimentStatus(str, Enum):
    """Experiment status enum"""
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class Experiment(BaseModel):
    """A/B experiment model"""
    __tablename__ = "experiments"
    
    game_id = Column(String, ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    hypothesis = Column(String, nullable=True)
    status = Column(SQLEnum(ExperimentStatus), default=ExperimentStatus.DRAFT, nullable=False, index=True)
    
    # Experiment configuration stored as JSON
    targeting = Column(JSON, nullable=False, default=dict)  # User segments, countries, etc.
    schedule = Column(JSON, nullable=False, default=dict)  # Start/end dates
    metrics = Column(JSON, nullable=False, default=dict)  # Primary/secondary metrics
    
    created_by = Column(String, nullable=False)
    
    # Relationships
    game = relationship("Game", back_populates="experiments")
    variants = relationship("ExperimentVariant", back_populates="experiment", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_experiment_game_status', 'game_id', 'status'),
    )


class ExperimentVariant(BaseModel):
    """Experiment variant model (control, treatment)"""
    __tablename__ = "experiment_variants"
    
    experiment_id = Column(String, ForeignKey("experiments.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    traffic_percent = Column(Integer, nullable=False)  # 0-100
    config_overrides = Column(JSON, nullable=False, default=dict)  # Partial config to override
    
    # Relationships
    experiment = relationship("Experiment", back_populates="variants")
    
    # Indexes
    __table_args__ = (
        Index('idx_variant_experiment', 'experiment_id'),
    )
