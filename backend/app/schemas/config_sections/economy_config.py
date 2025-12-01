from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field, field_validator, model_validator


class CurrencyType(str, Enum):
    """Currency type enum"""
    SOFT = "soft"
    HARD = "hard"


class ProductType(str, Enum):
    """Product type enum for real purchases"""
    CONSUMABLE = "Consumable"
    NON_CONSUMABLE = "NonConsumable"


class ResourceType(str, Enum):
    """Resource type enum for costs/rewards"""
    CURRENCY = "Currency"
    ITEM = "Item"


class Currency(BaseModel):
    """Currency schema - supports both legacy and new field names"""
    id: str = Field(..., min_length=1, description="Unique currency identifier")
    
    # New format fields (optional, but one of name/displayName required)
    displayName: Optional[str] = Field(default=None, description="Display name")
    description: Optional[str] = Field(default="", description="Currency description")
    iconPath: Optional[str] = Field(default="", description="Icon path in assets")
    startingBalance: Optional[int] = Field(default=None, ge=0, description="Starting balance")
    maxValue: Optional[int] = Field(default=0, ge=0, description="Max value (0 = unlimited)")
    allowNegative: Optional[bool] = Field(default=False, description="Allow negative balance")
    
    # Legacy format fields (optional for backward compatibility)
    name: Optional[str] = Field(default=None, min_length=1)
    icon_url: Optional[str] = Field(default="", description="Icon URL (legacy)")
    type: Optional[CurrencyType] = Field(default=CurrencyType.SOFT)
    starting_amount: Optional[int] = Field(default=None, ge=0, description="Starting amount (legacy)")
    
    @model_validator(mode='after')
    def ensure_required_fields(self):
        """Ensure we have either new or legacy field values"""
        # Handle name/displayName
        if not self.name and not self.displayName:
            raise ValueError('Either name or displayName is required')
        if not self.name:
            self.name = self.displayName
        if not self.displayName:
            self.displayName = self.name
            
        # Handle starting_amount/startingBalance
        if self.starting_amount is None and self.startingBalance is None:
            self.starting_amount = 0
            self.startingBalance = 0
        elif self.starting_amount is None:
            self.starting_amount = self.startingBalance
        elif self.startingBalance is None:
            self.startingBalance = self.starting_amount
            
        # Handle icon_url/iconPath
        if not self.icon_url and self.iconPath:
            self.icon_url = self.iconPath
        if not self.iconPath and self.icon_url:
            self.iconPath = self.icon_url
            
        return self
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "coins",
                "name": "Coins",
                "displayName": "Coins",
                "type": "soft",
                "starting_amount": 1000,
                "startingBalance": 1000
            }
        }


# ============================================
# INVENTORY ITEM SCHEMA
# ============================================

class InventoryItem(BaseModel):
    """Inventory item schema"""
    id: str = Field(..., min_length=1, description="Unique item identifier")
    displayName: str = Field(..., min_length=1, description="Display name")
    description: Optional[str] = Field(default="", description="Item description")
    iconPath: Optional[str] = Field(default="", description="Icon path in assets")
    startingQuantity: int = Field(default=0, ge=0, description="Starting quantity")
    isStackable: bool = Field(default=True, description="Whether item can stack")
    maxStackSize: int = Field(default=0, ge=0, description="Max stack size (0 = unlimited)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "item_undo",
                "displayName": "Undo",
                "description": "Allows you to undo a move",
                "iconPath": "Assets/Icons/undo.png",
                "startingQuantity": 3,
                "isStackable": True,
                "maxStackSize": 99
            }
        }


# ============================================
# RESOURCE REFERENCE (for costs/rewards)
# ============================================

class ResourceReference(BaseModel):
    """Resource reference schema for costs and rewards"""
    type: ResourceType = Field(..., description="Type of resource (Currency or Item)")
    resourceId: str = Field(..., min_length=1, description="ID of the currency or item")
    amount: int = Field(..., gt=0, description="Amount of resource")
    
    class Config:
        json_schema_extra = {
            "example": {
                "type": "Currency",
                "resourceId": "coins",
                "amount": 100
            }
        }


# ============================================
# BONUS SCHEMA (Conditional Rewards)
# ============================================

class Bonus(BaseModel):
    """Bonus schema for conditional rewards"""
    id: Optional[str] = Field(default=None, description="Unique bonus identifier")
    type: ResourceType = Field(..., description="Type of resource (Currency or Item)")
    resourceId: str = Field(..., min_length=1, description="ID of the currency or item")
    amount: int = Field(..., gt=0, description="Amount of resource")
    condition: Optional[str] = Field(default=None, description="Condition for bonus (e.g., 'first_purchase', 'vip_member')")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "first_purchase_bonus",
                "type": "Currency",
                "resourceId": "gems",
                "amount": 50,
                "condition": "first_purchase"
            }
        }


# ============================================
# VIRTUAL PURCHASE SCHEMA
# ============================================

class VirtualPurchase(BaseModel):
    """Virtual purchase schema - purchases using in-game currencies"""
    id: str = Field(..., min_length=1, description="Unique purchase identifier")
    name: str = Field(..., min_length=1, description="Purchase name")
    costs: List[ResourceReference] = Field(default_factory=list, description="What player pays")
    rewards: List[ResourceReference] = Field(default_factory=list, description="What player receives")
    bonuses: List[Bonus] = Field(default_factory=list, description="Conditional bonus rewards")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "purchase_hint_with_coin",
                "name": "Buy Hint with Coins",
                "costs": [
                    {"type": "Currency", "resourceId": "coins", "amount": 100}
                ],
                "rewards": [
                    {"type": "Item", "resourceId": "item_hint", "amount": 1}
                ],
                "bonuses": []
            }
        }


# ============================================
# REAL PURCHASE (IAP) SCHEMA
# ============================================

class RealPurchase(BaseModel):
    """Real money purchase (IAP) schema"""
    productId: str = Field(..., min_length=1, description="App Store / Play Store product ID")
    displayName: str = Field(..., min_length=1, description="Display name")
    productType: ProductType = Field(default=ProductType.CONSUMABLE, description="Product type")
    rewards: List[ResourceReference] = Field(default_factory=list, description="What player receives")
    bonuses: List[Bonus] = Field(default_factory=list, description="Conditional bonus rewards")
    
    class Config:
        json_schema_extra = {
            "example": {
                "productId": "studio.sun.game.gems100",
                "displayName": "100 Gems Pack",
                "productType": "Consumable",
                "rewards": [
                    {"type": "Currency", "resourceId": "gems", "amount": 100}
                ],
                "bonuses": [
                    {"type": "Currency", "resourceId": "gems", "amount": 10, "condition": "first_purchase"}
                ]
            }
        }


# ============================================
# ECONOMY SETTINGS SCHEMA
# ============================================

class EconomySettings(BaseModel):
    """Economy settings schema"""
    enableRefundProcessing: bool = Field(default=False, description="Enable refund processing")
    remoteConfigKey: Optional[str] = Field(default="ECONOMY_CONFIG", description="Remote config key")
    
    class Config:
        json_schema_extra = {
            "example": {
                "enableRefundProcessing": False,
                "remoteConfigKey": "ECONOMY_CONFIG"
            }
        }


# ============================================
# LEGACY SCHEMAS (for backward compatibility)
# ============================================

class CurrencyReward(BaseModel):
    """Currency reward schema (legacy)"""
    currency_id: str
    amount: int = Field(gt=0)


class IAPPackage(BaseModel):
    """In-App Purchase package schema (legacy)"""
    id: str
    product_id: str = Field(..., description="App Store / Play Store product ID")
    price: float = Field(gt=0)
    currency: str = Field(default="USD")
    rewards: List[CurrencyReward] = Field(default_factory=list)
    
    @field_validator('product_id')
    @classmethod
    def validate_product_id(cls, v: str) -> str:
        # Basic validation for app store product IDs
        if not v.startswith(('com.', 'android.', 'studio.')):
            raise ValueError('Product ID must start with com., android., or studio.')
        return v


class DailyReward(BaseModel):
    """Daily reward schema (legacy)"""
    day: int = Field(ge=1, le=30, description="Day number (1-30)")
    rewards: List[CurrencyReward]


# ============================================
# MAIN ECONOMY CONFIG SCHEMA
# ============================================

class EconomyConfig(BaseModel):
    """Economy configuration schema - supports both legacy and new formats"""
    # New format fields
    currencies: List[Currency] = Field(default_factory=list, description="Currency definitions")
    inventoryItems: List[InventoryItem] = Field(default_factory=list, description="Inventory item definitions")
    virtualPurchases: List[VirtualPurchase] = Field(default_factory=list, description="Virtual purchase definitions")
    realPurchases: List[RealPurchase] = Field(default_factory=list, description="Real money purchase definitions")
    settings: Optional[EconomySettings] = Field(default=None, description="Economy settings")
    
    # Legacy format fields
    iap_packages: List[IAPPackage] = Field(default_factory=list)
    daily_rewards: List[DailyReward] = Field(default_factory=list)
    
    @field_validator('daily_rewards')
    @classmethod
    def validate_daily_rewards_sequence(cls, v: List[DailyReward]) -> List[DailyReward]:
        if not v:
            return v
        days = [r.day for r in v]
        if len(days) != len(set(days)):
            raise ValueError('Daily rewards must have unique day numbers')
        return v
    
    @model_validator(mode='after')
    def ensure_default_settings(self):
        """Ensure settings has default value if not provided"""
        if self.settings is None:
            self.settings = EconomySettings()
        return self
    
    class Config:
        json_schema_extra = {
            "example": {
                "currencies": [
                    {"id": "coins", "displayName": "Coins", "type": "soft", "startingBalance": 1000},
                    {"id": "gems", "displayName": "Gems", "type": "hard", "startingBalance": 50}
                ],
                "inventoryItems": [
                    {"id": "item_hint", "displayName": "Hint", "startingQuantity": 3, "isStackable": True}
                ],
                "virtualPurchases": [
                    {
                        "id": "buy_hint",
                        "name": "Buy Hint",
                        "costs": [{"type": "Currency", "resourceId": "coins", "amount": 100}],
                        "rewards": [{"type": "Item", "resourceId": "item_hint", "amount": 1}]
                    }
                ],
                "realPurchases": [
                    {
                        "productId": "studio.game.gems100",
                        "displayName": "100 Gems",
                        "productType": "Consumable",
                        "rewards": [{"type": "Currency", "resourceId": "gems", "amount": 100}]
                    }
                ],
                "settings": {
                    "enableRefundProcessing": False,
                    "remoteConfigKey": "ECONOMY_CONFIG"
                }
            }
        }
