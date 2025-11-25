from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class ConfigStatus(str, Enum):
    """Configuration status enum"""
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    DEPLOYED = "deployed"
    ARCHIVED = "archived"


class Config(BaseModel):
    """Configuration model with versioning and approval workflow"""
    __tablename__ = "configs"
    
    version = Column(Integer, nullable=False)
    game_id = Column(String, ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    environment_id = Column(String, ForeignKey("environments.id", ondelete="SET NULL"), nullable=True)
    
    status = Column(SQLEnum(ConfigStatus), default=ConfigStatus.DRAFT, nullable=False, index=True)
    
    # JSON columns for flexible config structure (JSONB in PostgreSQL)
    game_core_config = Column(JSON, nullable=True)
    economy_config = Column(JSON, nullable=True)
    ad_config = Column(JSON, nullable=True)
    notification_config = Column(JSON, nullable=True)
    booster_config = Column(JSON, nullable=True)
    chapter_reward_config = Column(JSON, nullable=True)
    shop_config = Column(JSON, nullable=True)
    analytics_config = Column(JSON, nullable=True)
    ux_config = Column(JSON, nullable=True)
    
    # Audit fields
    created_by = Column(String, nullable=False)
    updated_by = Column(String, nullable=True)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    approved_by = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    deployed_at = Column(DateTime, nullable=True)
    
    # Relationships
    game = relationship("Game", back_populates="configs")
    environment = relationship("Environment", back_populates="configs")
    audit_logs = relationship("AuditLog", back_populates="config", foreign_keys="AuditLog.entity_id")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_config_game_env_status', 'game_id', 'environment_id', 'status'),
        Index('idx_config_game_version', 'game_id', 'version'),
    )
