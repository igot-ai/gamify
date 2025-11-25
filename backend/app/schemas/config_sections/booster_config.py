from pydantic import BaseModel, Field


class BoosterItem(BaseModel):
    """Individual booster configuration"""
    UnlockLevel: int = Field(ge=1, description="Level at which booster unlocks")
    RefillAmount: int = Field(ge=0, description="Amount to refill per interval")
    Start: int = Field(ge=0, description="Starting amount for new players")


class BoosterConfig(BaseModel):
    """Booster configuration for power-ups"""
    Undo: BoosterItem = Field(..., description="Undo booster configuration")
    Hint: BoosterItem = Field(..., description="Hint booster configuration")
    Shuffle: BoosterItem = Field(..., description="Shuffle booster configuration")
    AutoUseAfterAds: bool = Field(default=True, description="Auto-use booster after watching ad")
    
    class Config:
        json_schema_extra = {
            "example": {
                "Undo": {
                    "UnlockLevel": 2,
                    "RefillAmount": 1,
                    "Start": 2
                },
                "Hint": {
                    "UnlockLevel": 4,
                    "RefillAmount": 1,
                    "Start": 2
                },
                "Shuffle": {
                    "UnlockLevel": 3,
                    "RefillAmount": 1,
                    "Start": 2
                },
                "AutoUseAfterAds": True
            }
        }
