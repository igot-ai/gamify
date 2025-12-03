from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class GameBase(BaseModel):
    """Base game schema"""
    app_id: str  # User-defined App ID
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None


class GameCreate(BaseModel):
    """Schema for creating a new game"""
    app_id: str  # Required user-defined App ID
    name: str
    description: Optional[str] = None


class GameUpdate(BaseModel):
    """Schema for updating a game"""
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    # app_id cannot be updated after creation


class GameResponse(GameBase):
    """Schema for game response"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
