from pydantic import BaseModel, Field


class ShopConfig(BaseModel):
    """In-game shop configuration"""
    Enabled: bool = Field(default=True, description="Enable shop feature")
    RestoreMinLevel: int = Field(ge=1, description="Minimum level to restore purchases")
    
    class Config:
        json_schema_extra = {
            "example": {
                "Enabled": True,
                "RestoreMinLevel": 1
            }
        }
