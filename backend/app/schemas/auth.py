from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

from app.schemas import ORMBaseModel
from app.models.user import UserRole

class LoginRequest(BaseModel):
    """Schema for login request"""
    email: EmailStr
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    name: str
    role: UserRole = UserRole.game_operator


class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[UserRole] = None
    password: Optional[str] = Field(None, min_length=6)


class ProfileUpdate(BaseModel):
    """Schema for updating current user profile (name and password only)"""
    name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)


class AssignedGameInfo(ORMBaseModel):
    """Minimal game info for user's assigned games"""
    id: str
    app_id: str
    name: str


class UserResponse(UserBase, ORMBaseModel):
    """Schema for user response"""
    id: str
    created_at: datetime
    updated_at: datetime
    assigned_games: List[AssignedGameInfo] = []


class UserListResponse(ORMBaseModel):
    """Schema for user list response (without assigned games for performance)"""
    id: str
    email: str
    name: str
    role: UserRole
    created_at: datetime
    updated_at: datetime


class CurrentUserResponse(UserBase, ORMBaseModel):
    """Schema for current user response with assigned game IDs"""
    id: str
    assigned_game_ids: List[str] = []

