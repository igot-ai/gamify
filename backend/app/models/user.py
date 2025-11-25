from enum import Enum
from sqlalchemy import Column, String, JSON, Enum as SQLEnum
from app.models.base import BaseModel


class UserRole(str, Enum):
    """User role enum for permissions"""
    DESIGNER = "designer"
    LEAD_DESIGNER = "lead_designer"
    PRODUCT_MANAGER = "product_manager"
    ADMIN = "admin"


class User(BaseModel):
    """User model with role-based permissions"""
    __tablename__ = "users"
    
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    firebase_uid = Column(String, unique=True, nullable=True, index=True)
    role = Column(SQLEnum(UserRole), default=UserRole.DESIGNER, nullable=False, index=True)
    game_access = Column(JSON, nullable=False, default=list)  # List of game IDs
    is_active = Column(String, default=True, nullable=False)
