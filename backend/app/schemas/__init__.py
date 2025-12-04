"""Pydantic schemas for request/response validation"""

from pydantic import BaseModel, ConfigDict


class ORMBaseModel(BaseModel):
    """Base model with ORM mode enabled for SQLAlchemy compatibility"""
    model_config = ConfigDict(from_attributes=True)


# Schemas package
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
    CurrentUserResponse,
    AssignedGameInfo,
)

__all__ = [
    "ORMBaseModel",
    "LoginRequest",
    "TokenResponse",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserListResponse",
    "CurrentUserResponse",
    "AssignedGameInfo",
]
