from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.config import ConfigStatus
from app.schemas.config_sections.economy_config import EconomyConfig
from app.schemas.config_sections.ad_config import AdConfig
from app.schemas.config_sections.notification_config import NotificationConfig
from app.schemas.config_sections.booster_config import BoosterConfig
from app.schemas.config_sections.chapter_reward_config import ChapterRewardConfig
from app.schemas.config_sections.shop_config import ShopConfig
from app.schemas.config_sections.game_core_config import GameCoreConfig


class ConfigBase(BaseModel):
    """Base configuration schema"""
    game_id: str
    environment_id: Optional[str] = None
    game_core_config: Optional[GameCoreConfig] = None
    economy_config: Optional[EconomyConfig] = None
    ad_config: Optional[AdConfig] = None
    notification_config: Optional[NotificationConfig] = None
    booster_config: Optional[BoosterConfig] = None
    chapter_reward_config: Optional[ChapterRewardConfig] = None
    shop_config: Optional[ShopConfig] = None
    analytics_config: Optional[dict] = None
    ux_config: Optional[dict] = None


class ConfigCreate(ConfigBase):
    """Schema for creating a new configuration"""
    created_by: str


class ConfigUpdate(BaseModel):
    """Schema for updating a configuration"""
    game_core_config: Optional[GameCoreConfig] = None
    economy_config: Optional[EconomyConfig] = None
    ad_config: Optional[AdConfig] = None
    notification_config: Optional[NotificationConfig] = None
    booster_config: Optional[BoosterConfig] = None
    chapter_reward_config: Optional[ChapterRewardConfig] = None
    shop_config: Optional[ShopConfig] = None
    analytics_config: Optional[dict] = None
    ux_config: Optional[dict] = None
    updated_by: str


class ConfigResponse(ConfigBase):
    """Schema for configuration response"""
    id: str
    version: int
    status: ConfigStatus
    created_by: str
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    deployed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # Pydantic v2 (was orm_mode in v1)


class ConfigListResponse(BaseModel):
    """Schema for list of configurations"""
    configs: list[ConfigResponse]
    total: int
