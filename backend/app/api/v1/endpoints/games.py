from typing import List, Optional, Dict, Any
import json
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import ValidationError

from app.core.database import get_db
from app.core.response import ApiResponse, create_response
from app.models.game import Game
from app.schemas.game import GameUpdate, GameResponse, FirebaseServiceAccountValidation

router = APIRouter()

# Upload directory configuration
UPLOAD_DIR = Path(__file__).parent.parent.parent.parent / "uploads" / "avatars"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


async def parse_and_validate_firebase_service_account(file: UploadFile) -> Dict[str, Any]:
    """Parse and validate Firebase service account JSON file"""
    # Check file extension
    if file.filename and not file.filename.endswith('.json'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Firebase service account must be a JSON file"
        )
    
    # Read file content
    try:
        content = await file.read()
        service_account_data = json.loads(content.decode('utf-8'))
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON format in Firebase service account file"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read Firebase service account file: {str(e)}"
        )
    finally:
        await file.seek(0)  # Reset file pointer
    
    # Validate structure using Pydantic schema
    try:
        FirebaseServiceAccountValidation(**service_account_data)
    except ValidationError as e:
        errors = e.errors()
        missing_fields = [err['loc'][0] for err in errors if err['type'] == 'missing']
        if missing_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Firebase service account JSON is missing required fields: {', '.join(missing_fields)}"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Firebase service account JSON: {errors[0]['msg']}"
        )
    
    return service_account_data




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
    app_id: str = Form(..., description="User-defined App ID (unique identifier)"),
    name: str = Form(...),
    firebase_service_account: Optional[UploadFile] = File(None, description="Firebase service account JSON file (optional)"),
    description: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
):
    """Create a new game with optional Firebase service account JSON file and avatar"""
    # Parse and validate Firebase service account JSON if provided
    service_account_data = None
    if firebase_service_account and firebase_service_account.filename:
        service_account_data = await parse_and_validate_firebase_service_account(firebase_service_account)
    
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
        "firebase_service_account": service_account_data,
        "description": description,
    }
    
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


@router.patch("/{game_id}/firebase-service-account", response_model=ApiResponse[GameResponse])
async def update_firebase_service_account(
    game_id: str,
    firebase_service_account: UploadFile = File(..., description="Firebase service account JSON file"),
    db: AsyncSession = Depends(get_db),
):
    """Update a game's Firebase service account"""
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Parse and validate Firebase service account JSON
    service_account_data = await parse_and_validate_firebase_service_account(firebase_service_account)
    
    game.firebase_service_account = service_account_data
    
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
