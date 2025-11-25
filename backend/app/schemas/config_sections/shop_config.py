from pydantic import BaseModel, Field


class ShopConfig(BaseModel):
    """In-game shop configuration"""
    Enabled: bool = Field(default=True, description="Enable shop feature")
    RestoreMinLevel: int = Field(default=1, ge=1, description="Minimum level to restore purchases")
    categories: list = Field(default_factory=list, description="Shop categories")
    featured_items: list = Field(default_factory=list, description="Featured items")
    rotation_enabled: bool = Field(default=False, description="Enable shop rotation")
    
    class Config:
        json_schema_extra = {
            "example": {
                "Enabled": True,
                "RestoreMinLevel": 1
            }
        }
