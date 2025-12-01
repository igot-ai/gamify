from pydantic import BaseModel, Field


class RemoveAdsConfig(BaseModel):
    """Remove Ads offer configuration"""
    enabled: bool = Field(default=True, description="Whether the remove ads offer is enabled")
    minLevel: int = Field(..., ge=1, description="Minimum level to show the offer")
    adWatchedTrigger: int = Field(..., ge=0, description="Number of ads watched to trigger the offer")
    daysPlayedTrigger: int = Field(..., ge=0, description="Days played to trigger the offer")
    durationHours: int = Field(..., ge=1, description="Duration of the offer in hours")
    maxLifetimeShows: int = Field(..., ge=1, description="Maximum lifetime shows")
    maxSessionShows: int = Field(..., ge=1, description="Maximum shows per session")
    cooldownPopupHours: int = Field(..., ge=0, description="Cooldown between popup shows in hours")
    cooldownOfferHours: int = Field(..., ge=0, description="Cooldown between offer shows in hours")
    
    class Config:
        json_schema_extra = {
            "example": {
                "enabled": True,
                "minLevel": 5,
                "adWatchedTrigger": 4,
                "daysPlayedTrigger": 2,
                "durationHours": 24,
                "maxLifetimeShows": 4,
                "maxSessionShows": 1,
                "cooldownPopupHours": 24,
                "cooldownOfferHours": 24
            }
        }



