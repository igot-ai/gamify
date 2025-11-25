from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.response import ApiResponse, create_response
from app.models.game import Game
from app.models.environment import Environment
from app.schemas.game import GameCreate, GameUpdate, GameResponse, GameWithEnvironments

router = APIRouter()


@router.get("/", response_model=ApiResponse[List[GameResponse]])
async def list_games(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """List all games"""
    result = await db.execute(
        select(Game).offset(skip).limit(limit).order_by(Game.created_at.desc())
    )
    games = result.scalars().all()
    return create_response(games)


@router.post("/", response_model=ApiResponse[GameResponse], status_code=status.HTTP_201_CREATED)
async def create_game(
    game_in: GameCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new game with default environments"""
    # Create game
    game = Game(**game_in.dict())
    db.add(game)
    await db.flush()
    
    # Create default environments
    for env_name in ["production", "staging", "development"]:
        environment = Environment(name=env_name, game_id=game.id)
        db.add(environment)
    
    await db.commit()
    await db.refresh(game)
    return create_response(game)


@router.get("/{game_id}", response_model=ApiResponse[GameWithEnvironments])
async def get_game(
    game_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific game with its environments"""
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Get environments
    env_result = await db.execute(
        select(Environment).where(Environment.game_id == game_id)
    )
    environments = env_result.scalars().all()
    
    game_data = {
        **game.__dict__,
        "environments": [{"id": e.id, "name": e.name} for e in environments]
    }
    return create_response(game_data)


@router.patch("/{game_id}", response_model=ApiResponse[GameResponse])
async def update_game(
    game_id: str,
    game_update: GameUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a game"""
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Update fields
    update_data = game_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(game, field, value)
    
    await db.commit()
    await db.refresh(game)
    return create_response(game)


@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_game(
    game_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a game"""
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    await db.delete(game)
    await db.commit()
    return None
