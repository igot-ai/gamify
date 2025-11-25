from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class GameBase(BaseModel):
    """Base game schema"""
    name: str
    slug: str
    firebase_project_id: Optional[str] = None
    description: Optional[str] = None


class GameCreate(GameBase):
    """Schema for creating a new game"""
    pass


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
