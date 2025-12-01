from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Enum as SQLEnum, Index, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class SectionType(str, Enum):
    """Section type enum for different config sections"""
    ECONOMY = "economy"
    ADS = "ads"
    NOTIFICATION = "notification"
    SHOP = "shop"
    BOOSTER = "booster"
    CHAPTER_REWARD = "chapter_reward"
    GAME = "game"
    ANALYTICS = "analytics"
    UX = "ux"
    HAPTIC = "haptic"
    REMOVE_ADS = "remove_ads"
    TILE_BUNDLE = "tile_bundle"
    RATING = "rating"
    LINK = "link"
    GAME_ECONOMY = "game_economy"
    SHOP_SETTINGS = "shop_settings"
    SPIN = "spin"
    HINT_OFFER = "hint_offer"
    TUTORIAL = "tutorial"


class SectionConfig(BaseModel):
    """
    Single config record per game+section_type combination.
    Contains both draft (working) and published (live) data.
    Versioning is per section within each game.
    """
    __tablename__ = "section_configs"
    
    game_id = Column(String, ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    section_type = Column(SQLEnum(SectionType), nullable=False, index=True)
    
    # Working draft (always editable)
    draft_data = Column(JSON, nullable=True)
    draft_updated_at = Column(DateTime, nullable=True)
    draft_updated_by = Column(String, nullable=True)
    
    # Published state (null if never published)
    published_data = Column(JSON, nullable=True)
    published_version = Column(Integer, nullable=True)
    published_at = Column(DateTime, nullable=True)
    published_by = Column(String, nullable=True)
    
    # Dirty flag - indicates if draft has changes not yet published
    has_unpublished_changes = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    game = relationship("Game", back_populates="section_configs")
    versions = relationship("SectionConfigVersion", back_populates="section_config", cascade="all, delete-orphan")
    
    # Indexes and constraints - one record per game+section
    __table_args__ = (
        UniqueConstraint('game_id', 'section_type', name='uq_section_config_game_type'),
        Index('idx_section_config_game_type', 'game_id', 'section_type'),
    )


class SectionConfigVersion(BaseModel):
    """
    Immutable version snapshots created on each publish.
    Provides version history for rollback functionality.
    """
    __tablename__ = "section_config_versions"
    
    section_config_id = Column(String, ForeignKey("section_configs.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, nullable=False)
    config_data = Column(JSON, nullable=True)
    published_at = Column(DateTime, nullable=False)
    published_by = Column(String, nullable=False)
    description = Column(String, nullable=True)  # Optional publish note
    
    # Relationships
    section_config = relationship("SectionConfig", back_populates="versions")
    
    # Indexes and constraints
    __table_args__ = (
        UniqueConstraint('section_config_id', 'version', name='uq_section_config_version'),
        Index('idx_section_config_version_config_id', 'section_config_id'),
        Index('idx_section_config_version_version', 'section_config_id', 'version'),
    )
