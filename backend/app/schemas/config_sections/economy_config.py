from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field, HttpUrl, validator


class CurrencyType(str, Enum):
    """Currency type enum"""
    SOFT = "soft"
    HARD = "hard"


class Currency(BaseModel):
    """Currency schema"""
    id: str = Field(..., min_length=1, description="Unique currency identifier")
    name: str = Field(..., min_length=1)
    icon_url: Optional[HttpUrl] = None
    type: CurrencyType
    starting_amount: int = Field(ge=0, description="Starting amount for new players")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "coins",
                "name": "Coins",
                "type": "soft",
                "starting_amount": 1000
            }
        }


class CurrencyReward(BaseModel):
    """Currency reward schema"""
    currency_id: str
    amount: int = Field(gt=0)


class IAPPackage(BaseModel):
    """In-App Purchase package schema"""
    id: str
    product_id: str = Field(..., description="App Store / Play Store product ID")
    price: float = Field(gt=0)
    currency: str = Field(default="USD")
    rewards: List[CurrencyReward] = Field(min_length=1)
    
    @validator('product_id')
    def validate_product_id(cls, v: str) -> str:
        # Basic validation for app store product IDs
        if not v.startswith(('com.', 'android.')):
            raise ValueError('Product ID must start with com. or android.')
        return v


class DailyReward(BaseModel):
    """Daily reward schema"""
    day: int = Field(ge=1, le=30, description="Day number (1-30)")
    rewards: List[CurrencyReward]


class EconomyConfig(BaseModel):
    """Economy configuration schema"""
    currencies: List[Currency] = Field(min_length=1, description="At least one currency required")
    iap_packages: List[IAPPackage] = Field(default_factory=list)
    daily_rewards: List[DailyReward] = Field(default_factory=list)
    
    @validator('daily_rewards')
    def validate_daily_rewards_sequence(cls, v: List[DailyReward]) -> List[DailyReward]:
        if not v:
            return v
        days = [r.day for r in v]
        if len(days) != len(set(days)):
            raise ValueError('Daily rewards must have unique day numbers')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "currencies": [
                    {"id": "coins", "name": "Coins", "type": "soft", "starting_amount": 1000},
                    {"id": "gems", "name": "Gems", "type": "hard", "starting_amount": 50}
                ],
                "iap_packages": [
                    {
                        "id": "starter_pack",
                        "product_id": "com.sunstudio.game.starter",
                        "price": 4.99,
                        "rewards": [{"currency_id": "gems", "amount": 500}]
                    }
                ]
            }
        }
