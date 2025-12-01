from pydantic import BaseModel, Field


class TileBundleConfig(BaseModel):
    """Tile Bundle offer configuration"""
    enabled: bool = Field(default=True, description="Whether the tile bundle offer is enabled")
    discount: int = Field(..., ge=0, le=100, description="Discount percentage (0-100)")
    minLevel: int = Field(..., ge=1, description="Minimum level to show the offer")
    daysPlayedTrigger: int = Field(..., ge=0, description="Days played to trigger the offer")
    sessionsPlayedTrigger: int = Field(..., ge=0, description="Sessions played to trigger the offer")
    durationHours: int = Field(..., ge=1, description="Duration of the offer in hours")
    maxLifetimeShows: int = Field(..., ge=1, description="Maximum lifetime shows")
    maxSessionShows: int = Field(..., ge=1, description="Maximum shows per session")
    cooldownPopupHours: int = Field(..., ge=0, description="Cooldown between popup shows in hours")
    cooldownOfferHours: int = Field(..., ge=0, description="Cooldown between offer shows in hours")
    
    class Config:
        json_schema_extra = {
            "example": {
                "enabled": True,
                "discount": 80,
                "minLevel": 20,
                "daysPlayedTrigger": 2,
                "sessionsPlayedTrigger": 1,
                "durationHours": 24,
                "maxLifetimeShows": 2,
                "maxSessionShows": 1,
                "cooldownPopupHours": 48,
                "cooldownOfferHours": 48
            }
        }







