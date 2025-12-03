from enum import Enum
from sqlalchemy import Column, String, ForeignKey, JSON, Enum as SQLEnum, Index, UniqueConstraint
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
    Acts as a container for versions.
    """
    __tablename__ = "section_configs"
    
    game_id = Column(String, ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    section_type = Column(SQLEnum(SectionType), nullable=False, index=True)
    
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
    Editable version (config container) for a section config.
    Each version has metadata (title, description, experiment, variant) and config data.
    """
    __tablename__ = "section_config_versions"
    
    section_config_id = Column(String, ForeignKey("section_configs.id", ondelete="CASCADE"), nullable=False)
    
    # Version metadata
    title = Column(String, nullable=True)
    description = Column(String, nullable=True)
    experiment = Column(String, nullable=True)
    variant = Column(String, nullable=True)
    
    # Config data
    config_data = Column(JSON, nullable=True)
    
    # Relationships
    section_config = relationship("SectionConfig", back_populates="versions")
    
    # Indexes and constraints
    __table_args__ = (
        Index('idx_section_config_version_config_id', 'section_config_id'),
    )
