"""Firebase Remote Config sync endpoints"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.response import ApiResponse, create_response
from app.models.game import Game
from app.models.section_config import SectionConfig
from app.services.firebase_service import get_firebase_service
from app.services.config_converter import get_config_converter

router = APIRouter()


@router.get("/import/{game_id}", response_model=ApiResponse[Dict[str, Any]])
async def import_from_firebase(
    game_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Import current configuration from Firebase Remote Config.
    
    This will fetch the current Remote Config template from Firebase
    and return it in portal format (not saved to database yet).
    """
    # Verify game exists
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    try:
        # Get Firebase service and converter
        firebase_service = get_firebase_service()
        converter = get_config_converter()
        
        # Fetch current template from Firebase
        firebase_template = await firebase_service.get_current_template()
        
        # Extract parameters
        firebase_params = {
            key: param.get("default_value", "")
            for key, param in firebase_template.get("parameters", {}).items()
        }
        
        # Convert to portal format
        portal_config = converter.firebase_to_portal(firebase_params)
        
        return create_response({
            "game_id": game_id,
            "firebase_version": firebase_template.get("version", {}).get("version_number"),
            "config": portal_config,
            "imported_at": firebase_template.get("version", {}).get("update_time"),
        })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to import from Firebase: {str(e)}"
        )


@router.get("/status/{game_id}", response_model=ApiResponse[Dict[str, Any]])
async def get_firebase_status(
    game_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Check Firebase Remote Config sync status for a game.
    
    Returns information about the current Firebase template
    and last deployed section configurations from portal.
    """
    # Verify game exists
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    try:
        # Get Firebase template
        firebase_service = get_firebase_service()
        firebase_template = await firebase_service.get_current_template()
        
        # Get published section configs from database
        published_result = await db.execute(
            select(SectionConfig)
            .where(SectionConfig.game_id == game_id)
            .where(SectionConfig.published_version.isnot(None))
            .order_by(desc(SectionConfig.published_at))
        )
        published_configs = published_result.scalars().all()
        
        deployed_sections = [
            {
                "section_type": config.section_type.value,
                "version": config.published_version,
                "deployed_at": config.published_at.isoformat() if config.published_at else None,
            }
            for config in published_configs
        ]
        
        return create_response({
            "game_id": game_id,
            "firebase": {
                "version": firebase_template.get("version", {}).get("version_number"),
                "last_updated": firebase_template.get("version", {}).get("update_time"),
                "parameters_count": len(firebase_template.get("parameters", {})),
            },
            "portal": {
                "deployed_sections": deployed_sections,
            }
        })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Firebase status: {str(e)}"
        )


@router.get("/version-history/{game_id}", response_model=ApiResponse[Dict[str, Any]])
async def get_firebase_version_history(
    game_id: str,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
):
    """Get Firebase Remote Config version history"""
    # Verify game exists
    result = await db.execute(select(Game).where(Game.id == game_id))
    game = result.scalar_one_or_none()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    try:
        firebase_service = get_firebase_service()
        versions = await firebase_service.get_version_history(limit=limit)
        
        return create_response({
            "game_id": game_id,
            "versions": versions
        })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get version history: {str(e)}"
        )
