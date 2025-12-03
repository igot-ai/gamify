from sqlalchemy import Column, String, Boolean, Table, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from enum import Enum
from app.models.base import BaseModel
from app.core.database import Base


class UserRole(str, Enum):
    """User role enum for permissions"""
    # Use lowercase names to match PostgreSQL enum values
    admin = "admin"
    game_operator = "game_operator"


# Association table for many-to-many relationship between users and games
user_game_assignments = Table(
    'user_game_assignments',
    Base.metadata,
    Column('user_id', String, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('game_id', String, ForeignKey('games.id', ondelete='CASCADE'), primary_key=True)
)


class User(BaseModel):
    """User model for authentication and authorization"""
    __tablename__ = "users"
    
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.game_operator)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships - games assigned to this user (for game operators)
    assigned_games = relationship(
        "Game",
        secondary=user_game_assignments,
        back_populates="assigned_operators"
    )
