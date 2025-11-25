"""Pydantic schemas for environments"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class EnvironmentBase(BaseModel):
    """Base environment schema"""
    name: str = Field(..., description="Environment name (development, staging, production)")
    firebase_config: Optional[Dict[str, Any]] = Field(None, description="Firebase-specific configuration")


class EnvironmentResponse(EnvironmentBase):
    """Environment response schema"""
    id: str
    game_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class EnvironmentUpdate(BaseModel):
    """Environment update schema"""
    firebase_config: Optional[Dict[str, Any]] = None


