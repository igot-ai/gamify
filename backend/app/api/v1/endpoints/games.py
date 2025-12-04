"""Games API endpoints"""

from typing import List, Optional

from fastapi import APIRouter, Depends, status, UploadFile, File, Form

from app.api.dependencies import get_current_user, require_admin, get_game_service
from app.models.user import User
from app.schemas.game import GameUpdate, GameResponse
from app.services.game_service import GameService

router = APIRouter()


@router.get("", response_model=List[GameResponse])
async def list_games(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service)
):
    """
    List games.
    - Admin: sees all games
    - Game Operator: sees only assigned games
    """
    games = await game_service.list_games(current_user, skip, limit)
    return games


@router.post("", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
async def create_game(
    app_id: str = Form(..., description="User-defined App ID (unique identifier)"),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_admin),
    game_service: GameService = Depends(get_game_service)
):
    """Create a new game with optional logo. Admin only."""
    game = await game_service.create_game(app_id, name, description, logo)
    return game


@router.get("/{app_id}", response_model=GameResponse)
async def get_game(
    app_id: str,
    current_user: User = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service)
):
    """Get a specific game. User must have access to the game."""
    game = await game_service.get_game(app_id, current_user)
    return game


@router.patch("/{app_id}", response_model=GameResponse)
async def update_game(
    app_id: str,
    game_update: GameUpdate,
    current_user: User = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service)
):
    """Update a game. User must have access to the game."""
    game = await game_service.update_game(app_id, game_update, current_user)
    return game


@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_game(
    app_id: str,
    current_user: User = Depends(require_admin),
    game_service: GameService = Depends(get_game_service)
):
    """Delete a game. Admin only."""
    await game_service.delete_game(app_id)
