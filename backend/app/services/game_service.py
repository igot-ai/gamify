"""Game service - business logic for game operations"""

from typing import List, Optional

from fastapi import HTTPException, status, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import can_access_game
from app.models.game import Game
from app.models.user import User, UserRole
from app.schemas.game import GameUpdate
from app.utils.file_utils import save_logo


class GameService:
    """Service for game operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def list_games(
        self, 
        current_user: User, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Game]:
        """
        List games based on user role.
        - Admin: sees all games
        - Game Operator: sees only assigned games
        """
        if current_user.role == UserRole.admin:
            # Admin sees all games
            result = await self.db.execute(
                select(Game)
                .offset(skip)
                .limit(limit)
                .order_by(Game.created_at.desc())
            )
            return list(result.scalars().all())
        else:
            # Game operator sees only assigned games
            assigned_app_ids = [game.app_id for game in current_user.assigned_games]
            if not assigned_app_ids:
                return []
            
            result = await self.db.execute(
                select(Game)
                .where(Game.app_id.in_(assigned_app_ids))
                .offset(skip)
                .limit(limit)
                .order_by(Game.created_at.desc())
            )
            return list(result.scalars().all())
    
    async def get_game(self, app_id: str, current_user: User) -> Game:
        """
        Get a game by app_id with access check.
        
        Raises:
            HTTPException: If game not found or user doesn't have access
        """
        result = await self.db.execute(
            select(Game).where(Game.app_id == app_id)
        )
        game = result.scalar_one_or_none()
        
        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found"
            )
        
        # Check access
        if not can_access_game(current_user, app_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this game"
            )
        
        return game
    
    async def create_game(
        self,
        app_id: str,
        name: str,
        description: Optional[str] = None,
        logo: Optional[UploadFile] = None
    ) -> Game:
        """
        Create a new game.
        
        Raises:
            HTTPException: If app_id already exists
        """
        # Check if app_id already exists
        result = await self.db.execute(
            select(Game).where(Game.app_id == app_id)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Game with app_id '{app_id}' already exists"
            )
        
        # Build game data
        game_data = {
            "app_id": app_id,
            "name": name,
            "description": description,
        }
        
        # Handle logo upload
        if logo and logo.filename:
            game_data["logo_url"] = await save_logo(logo)
        
        # Create game
        game = Game(**game_data)
        self.db.add(game)
        await self.db.commit()
        await self.db.refresh(game)
        
        return game
    
    async def update_game(
        self, 
        app_id: str, 
        update_data: GameUpdate, 
        current_user: User
    ) -> Game:
        """
        Update a game with access check.
        
        Raises:
            HTTPException: If game not found or user doesn't have access
        """
        result = await self.db.execute(
            select(Game).where(Game.app_id == app_id)
        )
        game = result.scalar_one_or_none()
        
        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found"
            )
        
        # Check access
        if not can_access_game(current_user, app_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this game"
            )
        
        # Update fields
        data = update_data.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(game, field, value)
        
        await self.db.commit()
        await self.db.refresh(game)
        
        return game
    
    async def delete_game(self, app_id: str) -> None:
        """
        Delete a game.
        
        Raises:
            HTTPException: If game not found
        """
        result = await self.db.execute(
            select(Game).where(Game.app_id == app_id)
        )
        game = result.scalar_one_or_none()
        
        if not game:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found"
            )
        
        await self.db.delete(game)
        await self.db.commit()
    
    def verify_game_access(self, game_id: str, current_user: User) -> None:
        """
        Verify user has access to the game.
        
        Raises:
            HTTPException: If user doesn't have access
        """
        if not can_access_game(current_user, game_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this game"
            )
