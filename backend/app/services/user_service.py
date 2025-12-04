"""User service - business logic for user operations"""

from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.auth import get_password_hash
from app.models.user import User
from app.models.game import Game
from app.schemas.auth import UserCreate, UserUpdate, ProfileUpdate


class UserService:
    """Service for user operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def list_users(self) -> List[User]:
        """List all users ordered by creation date"""
        result = await self.db.execute(
            select(User).order_by(User.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def get_user(self, user_id: str) -> User:
        """
        Get a user by ID with assigned games.
        
        Raises:
            HTTPException: If user not found
        """
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.assigned_games))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        return user
    
    async def create_user(self, user_data: UserCreate) -> User:
        """
        Create a new user.
        
        Raises:
            HTTPException: If email already exists
        """
        # Check if email already exists
        result = await self.db.execute(
            select(User).where(User.email == user_data.email)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
        # Create new user
        new_user = User(
            email=user_data.email,
            name=user_data.name,
            role=user_data.role,
            hashed_password=get_password_hash(user_data.password),
        )
        self.db.add(new_user)
        await self.db.flush()
        await self.db.refresh(new_user)
        
        # Load relationships for response
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.assigned_games))
            .where(User.id == new_user.id)
        )
        return result.scalar_one()
    
    async def update_user(self, user_id: str, user_data: UserUpdate) -> User:
        """
        Update a user.
        
        Raises:
            HTTPException: If user not found or email already exists
        """
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.assigned_games))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Check if trying to update email to one that already exists
        if user_data.email and user_data.email != user.email:
            result = await self.db.execute(
                select(User).where(User.email == user_data.email)
            )
            if result.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered",
                )
        
        # Update fields
        update_data = user_data.model_dump(exclude_unset=True)
        
        # Hash password if provided
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        await self.db.flush()
        await self.db.refresh(user)
        
        return user
    
    async def update_profile(self, user_id: str, profile_data: ProfileUpdate) -> User:
        """
        Update current user profile (name and password only).
        
        Raises:
            HTTPException: If user not found
        """
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.assigned_games))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Update fields
        update_data = profile_data.model_dump(exclude_unset=True)
        
        # Hash password if provided
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        await self.db.flush()
        await self.db.refresh(user)
        
        return user
    
    async def delete_user(self, user_id: str, current_user_id: str) -> None:
        """
        Delete a user.
        
        Raises:
            HTTPException: If user not found or trying to delete self
        """
        if user_id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account",
            )
        
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        await self.db.delete(user)
        await self.db.commit()
    
    async def assign_game(self, user_id: str, app_id: str) -> User:
        """
        Assign a game to a user.
        
        Raises:
            HTTPException: If user/game not found or already assigned
        """
        # Get user with assigned games
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.assigned_games))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Get game by app_id
        result = await self.db.execute(
            select(Game).where(Game.app_id == app_id)
        )
        game = result.scalar_one_or_none()
        
        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found",
            )
        
        # Check if already assigned
        if game in user.assigned_games:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Game already assigned to user",
            )
        
        # Assign game
        user.assigned_games.append(game)
        await self.db.flush()
        await self.db.refresh(user)
        
        return user
    
    async def remove_game(self, user_id: str, app_id: str) -> User:
        """
        Remove a game assignment from a user.
        
        Raises:
            HTTPException: If user not found or game not assigned
        """
        # Get user with assigned games
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.assigned_games))
            .where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Find and remove the game by app_id
        game_to_remove = None
        for game in user.assigned_games:
            if game.app_id == app_id:
                game_to_remove = game
                break
        
        if not game_to_remove:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not assigned to user",
            )
        
        user.assigned_games.remove(game_to_remove)
        await self.db.flush()
        await self.db.refresh(user)
        
        return user

