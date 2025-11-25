from typing import List
from pydantic import BaseModel, Field


class AdNetwork(BaseModel):
    """Ad network configuration"""
    id: str
    enabled: bool = True
    app_id: str
    priority: int = Field(ge=1, description="Priority order (1=highest)")


class FrequencyCap(BaseModel):
    """Ad frequency cap configuration"""
    count: int = Field(gt=0, description="Number of ads allowed")
    period_minutes: int = Field(gt=0, description="Time period in minutes")


class AdPlacement(BaseModel):
    """Ad placement configuration"""
    enabled: bool = True
    frequency_cap: FrequencyCap
    reward: dict = Field(default_factory=dict, description="Optional reward for rewarded ads")


class AdConfig(BaseModel):
    """Advertisement configuration schema"""
    networks: List[AdNetwork] = Field(min_length=1, description="At least one ad network required")
    interstitial: AdPlacement
    rewarded: AdPlacement
    banner: AdPlacement
    remove_ads_product_id: str = Field(default="", description="IAP for removing ads")
    
    class Config:
        json_schema_extra = {
            "example": {
                "networks": [
                    {"id": "admob", "enabled": True, "app_id": "ca-app-pub-xxx", "priority": 1},
                    {"id": "unity", "enabled": True, "app_id": "unity-app-id", "priority": 2}
                ],
                "interstitial": {
                    "enabled": True,
                    "frequency_cap": {"count": 3, "period_minutes": 60}
                },
                "rewarded": {
                    "enabled": True,
                    "frequency_cap": {"count": 10, "period_minutes": 1440},
                    "reward": {"currency_id": "coins", "amount": 200}
                },
                "banner": {
                    "enabled": False,
                    "frequency_cap": {"count": 1, "period_minutes": 1}
                },
                "remove_ads_product_id": "com.sunstudio.game.noads"
            }
        }
