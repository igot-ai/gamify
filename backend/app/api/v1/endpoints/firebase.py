"""Firebase Remote Config sync endpoints"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.response import ApiResponse, create_response
from app.models.game import Game
from app.models.config import Config, ConfigStatus
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


@router.post("/deploy/{config_id}", response_model=ApiResponse[Dict[str, Any]])
async def deploy_to_firebase(
    config_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Deploy a configuration to Firebase Remote Config.
    
    This endpoint is an alias for /api/v1/configs/{config_id}/deploy
    but provides more detailed Firebase deployment information.
    """
    result = await db.execute(select(Config).where(Config.id == config_id))
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    
    if config.status != ConfigStatus.APPROVED:
        raise HTTPException(
            status_code=400,
            detail="Can only deploy APPROVED configs. Current status: " + config.status.value
        )
    
    try:
        # Get services
        firebase_service = get_firebase_service()
        converter = get_config_converter()
        
        # Prepare config data
        config_dict = {
            "game_core_config": config.game_core_config,
            "economy_config": config.economy_config,
            "ad_config": config.ad_config,
            "notification_config": config.notification_config,
            "booster_config": config.booster_config,
            "chapter_reward_config": config.chapter_reward_config,
            "shop_config": config.shop_config,
            "analytics_config": config.analytics_config,
            "ux_config": config.ux_config,
        }
        
        # Validate and convert
        is_valid, error_msg = converter.validate_portal_config(config_dict)
        if not is_valid:
            raise HTTPException(status_code=400, detail=f"Invalid config: {error_msg}")
        
        firebase_params = converter.portal_to_firebase(config_dict)
        
        # Deploy to Firebase
        deployment_result = await firebase_service.update_template(firebase_params)
        
        # Update config status
        from datetime import datetime
        config.status = ConfigStatus.DEPLOYED
        config.deployed_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(config)
        
        return create_response({
            "config_id": config_id,
            "firebase_version": deployment_result.get("version_number"),
            "deployed_at": deployment_result.get("update_time"),
            "parameters_count": len(firebase_params),
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to deploy to Firebase: {str(e)}"
        )


@router.get("/status/{game_id}", response_model=ApiResponse[Dict[str, Any]])
async def get_firebase_status(
    game_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Check Firebase Remote Config sync status for a game.
    
    Returns information about the current Firebase template
    and last deployed configuration from portal.
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
        
        # Get last deployed config from database
        deployed_result = await db.execute(
            select(Config)
            .where(Config.game_id == game_id)
            .where(Config.status == ConfigStatus.DEPLOYED)
            .order_by(Config.deployed_at.desc())
            .limit(1)
        )
        last_deployed = deployed_result.scalar_one_or_none()
        
        return create_response({
            "game_id": game_id,
            "firebase": {
                "version": firebase_template.get("version", {}).get("version_number"),
                "last_updated": firebase_template.get("version", {}).get("update_time"),
                "parameters_count": len(firebase_template.get("parameters", {})),
            },
            "portal": {
                "last_deployed_config_id": last_deployed.id if last_deployed else None,
                "last_deployed_at": last_deployed.deployed_at.isoformat() if last_deployed and last_deployed.deployed_at else None,
                "version": last_deployed.version if last_deployed else None,
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


