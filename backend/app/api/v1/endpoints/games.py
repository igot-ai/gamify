from typing import List, Optional
import re
import os
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.response import ApiResponse, create_response
from app.models.game import Game
from app.schemas.game import GameCreate, GameUpdate, GameResponse

router = APIRouter()

# Upload directory configuration
UPLOAD_DIR = Path(__file__).parent.parent.parent.parent / "uploads" / "avatars"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def slugify(text: str) -> str:
    """Convert text to slug format"""
    # Convert to lowercase
    text = text.lower()
    # Replace spaces and underscores with hyphens
    text = re.sub(r'[\s_]+', '-', text)
    # Remove any characters that aren't alphanumeric or hyphens
    text = re.sub(r'[^a-z0-9-]', '', text)
    # Remove multiple consecutive hyphens
    text = re.sub(r'-+', '-', text)
    # Strip hyphens from start and end
    text = text.strip('-')
    return text


async def save_avatar(file: UploadFile) -> str:
    """Save uploaded avatar file and return the relative path"""
    # Ensure upload directory exists
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower() if file.filename else ""
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()
    
    # Return relative path for storage in database
    return f"/uploads/avatars/{unique_filename}"


@router.get("", response_model=ApiResponse[List[GameResponse]])
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


@router.post("", response_model=ApiResponse[GameResponse], status_code=status.HTTP_201_CREATED)
async def create_game(
    name: str = Form(...),
    firebase_project_id: str = Form(...),
    description: Optional[str] = Form(None),
    slug: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
):
    """Create a new game with optional avatar"""
    # Build game data
    game_data = {
        "name": name,
        "firebase_project_id": firebase_project_id,
        "description": description,
        "slug": slug if slug else slugify(name),
    }
    
    # Check if slug already exists
    existing = await db.execute(
        select(Game).where(Game.slug == game_data['slug'])
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Game with slug '{game_data['slug']}' already exists"
        )
    
    # Handle avatar upload
    if avatar and avatar.filename:
        game_data["avatar_url"] = await save_avatar(avatar)
    
    # Create game
    game = Game(**game_data)
    db.add(game)
    await db.commit()
    await db.refresh(game)
    return create_response(game)


@router.get("/{game_id}", response_model=ApiResponse[GameResponse])
async def get_game(
    game_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific game"""
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return create_response(game)


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
