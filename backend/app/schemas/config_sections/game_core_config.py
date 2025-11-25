from pydantic import BaseModel, Field, validator
import re


class GameCoreConfig(BaseModel):
    """Core game configuration and feature flags"""
    Version: str = Field(..., min_length=1, description="Game version (e.g., 1.0.0)")
    BuildNumber: int = Field(ge=1, description="Build number")
    MinSupportedVersion: str = Field(..., description="Minimum supported client version")
    ForceUpdate: bool = Field(default=False, description="Force client update")
    MaintenanceMode: bool = Field(default=False, description="Enable maintenance mode")
    MaintenanceMessage: str = Field(default="", description="Maintenance message to display")
    
    @validator('Version', 'MinSupportedVersion')
    def validate_version_format(cls, v: str) -> str:
        """Validate semantic version format (e.g., 1.0.0)"""
        pattern = r'^\d+\.\d+\.\d+$'
        if not re.match(pattern, v):
            raise ValueError('Version must be in format X.Y.Z (e.g., 1.0.0)')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "Version": "1.0.0",
                "BuildNumber": 100,
                "MinSupportedVersion": "1.0.0",
                "ForceUpdate": False,
                "MaintenanceMode": False,
                "MaintenanceMessage": ""
            }
        }
