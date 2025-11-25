from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class GameBase(BaseModel):
    """Base game schema"""
    name: str
    slug: str
    firebase_project_id: Optional[str] = None
    description: Optional[str] = None


class GameCreate(BaseModel):
    """Schema for creating a new game"""
    name: str
    firebase_project_id: str
    description: Optional[str] = None
    slug: Optional[str] = None  # Auto-generated from name if not provided


class GameUpdate(BaseModel):
    """Schema for updating a game"""
    name: Optional[str] = None
    firebase_project_id: Optional[str] = None
    description: Optional[str] = None


class GameResponse(GameBase):
    """Schema for game response"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class GameWithEnvironments(GameResponse):
    """Schema for game with environments"""
    environments: List[dict]
