from typing import List, Optional
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.response import ApiResponse, create_response
from app.core.auth import get_current_user, require_admin, can_access_game
from app.models.game import Game
from app.models.user import User, UserRole
from app.schemas.game import GameUpdate, GameResponse

router = APIRouter()

# Upload directory configuration
UPLOAD_DIR = Path(__file__).parent.parent.parent.parent / "uploads" / "logos"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


async def save_logo(file: UploadFile) -> str:
    """Save uploaded logo file and return the relative path"""
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
    return f"/uploads/logos/{unique_filename}"


@router.get("", response_model=ApiResponse[List[GameResponse]])
async def list_games(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List games.
    - Admin: sees all games
    - Game Operator: sees only assigned games
    """
    if current_user.role == UserRole.admin:
        # Admin sees all games
        result = await db.execute(
            select(Game).offset(skip).limit(limit).order_by(Game.created_at.desc())
        )
        games = result.scalars().all()
    else:
        # Game operator sees only assigned games
        assigned_game_ids = [game.id for game in current_user.assigned_games]
        if not assigned_game_ids:
            return create_response([])
        
        result = await db.execute(
            select(Game)
            .where(Game.id.in_(assigned_game_ids))
            .offset(skip)
            .limit(limit)
            .order_by(Game.created_at.desc())
        )
        games = result.scalars().all()
    
    return create_response(games)


@router.post("", response_model=ApiResponse[GameResponse], status_code=status.HTTP_201_CREATED)
async def create_game(
    app_id: str = Form(..., description="User-defined App ID (unique identifier)"),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new game with optional logo. Admin only."""
    # Check if app_id already exists
    existing = await db.execute(
        select(Game).where(Game.app_id == app_id)
    )
    if existing.scalar_one_or_none():
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
    db.add(game)
    await db.commit()
    await db.refresh(game)
    return create_response(game)


@router.get("/{game_id}", response_model=ApiResponse[GameResponse])
async def get_game(
    game_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific game. User must have access to the game."""
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Check access
    if not can_access_game(current_user, game_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this game"
        )
    
    return create_response(game)


@router.patch("/{game_id}", response_model=ApiResponse[GameResponse])
async def update_game(
    game_id: str,
    game_update: GameUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a game. User must have access to the game."""
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Check access
    if not can_access_game(current_user, game_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this game"
        )
    
    # Update fields
    update_data = game_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(game, field, value)
    
    await db.commit()
    await db.refresh(game)
    return create_response(game)


@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_game(
    game_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete a game. Admin only."""
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    await db.delete(game)
    await db.commit()
    return None
