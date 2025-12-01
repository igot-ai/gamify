from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_

from app.core.database import get_db
from app.core.response import ApiResponse, create_response
from app.core.auth import get_current_user, CurrentUser
from app.models.section_config import SectionConfig, SectionType, SectionConfigVersion
from app.models.audit_log import AuditAction
from app.schemas.section_config import (
    SectionConfigUpdate,
    SectionConfigPublish,
    SectionConfigResponse,
    SectionConfigVersionResponse,
    SectionConfigVersionListResponse,
    SectionConfigSummary,
)
from app.services.audit_service import AuditService

router = APIRouter()


# Map section type to Firebase parameter name
SECTION_TO_FIREBASE_PARAM = {
    SectionType.ECONOMY: "ECONOMY_CONFIG",
    SectionType.ADS: "AD_CONFIG",
    SectionType.NOTIFICATION: "NOTIFICATION_CONFIG",
    SectionType.SHOP: "SHOP_CONFIG",
    SectionType.BOOSTER: "BOOSTER_CONFIG",
    SectionType.CHAPTER_REWARD: "CHAPTER_REWARD_CONFIG",
    SectionType.GAME: "GAME_CORE_CONFIG",
    SectionType.ANALYTICS: "ANALYTICS_CONFIG",
    SectionType.UX: "UX_CONFIG",
    SectionType.HAPTIC: "HAPTIC_CONFIG",
    SectionType.REMOVE_ADS: "REMOVE_ADS_CONFIG",
    SectionType.TILE_BUNDLE: "TILE_BUNDLE_CONFIG",
    SectionType.RATING: "RATING_CONFIG",
    SectionType.LINK: "LINK_CONFIG",
    SectionType.GAME_ECONOMY: "GAME_ECONOMY_CONFIG",
    SectionType.SHOP_SETTINGS: "SHOP_SETTINGS_CONFIG",
    SectionType.SPIN: "SPIN_CONFIG",
    SectionType.HINT_OFFER: "HINT_OFFER_CONFIG",
    SectionType.TUTORIAL: "TUTORIAL_CONFIG",
}


@router.get("", response_model=ApiResponse[SectionConfigResponse])
async def get_or_create_section_config(
    game_id: str = Query(..., description="Game ID"),
    section_type: SectionType = Query(..., description="Section type"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get section config for a game+section combination.
    Auto-creates the config if it doesn't exist (one record per game+section).
    """
    # Try to find existing config
    result = await db.execute(
        select(SectionConfig).where(
            and_(
                SectionConfig.game_id == game_id,
                SectionConfig.section_type == section_type
            )
        )
    )
    section_config = result.scalar_one_or_none()
    
    # Auto-create if doesn't exist
    if not section_config:
        section_config = SectionConfig(
            game_id=game_id,
            section_type=section_type,
            draft_data=None,
            draft_updated_at=None,
            draft_updated_by=None,
            published_data=None,
            published_version=None,
            published_at=None,
            published_by=None,
            has_unpublished_changes=False,
        )
        db.add(section_config)
        await db.commit()
        await db.refresh(section_config)
        
        # Log audit trail
        audit_service = AuditService(db)
        await audit_service.log_action(
            entity_type="section_config",
            entity_id=section_config.id,
            action=AuditAction.CREATE,
            user_id=current_user.uid,
            changes={"game_id": game_id, "section_type": section_type.value}
        )
        await db.commit()
    
    return create_response(section_config)


@router.get("/summary", response_model=ApiResponse[List[SectionConfigSummary]])
async def get_section_configs_summary(
    game_id: str = Query(..., description="Game ID"),
    db: AsyncSession = Depends(get_db),
):
    """Get summary of all section configs for a game"""
    summaries = []
    
    for section_type in SectionType:
        # Get config for this section type
        result = await db.execute(
            select(SectionConfig).where(
                and_(
                    SectionConfig.game_id == game_id,
                    SectionConfig.section_type == section_type
                )
            )
        )
        config = result.scalar_one_or_none()
        
        summaries.append(SectionConfigSummary(
            section_type=section_type,
            published_version=config.published_version if config else None,
            has_unpublished_changes=config.has_unpublished_changes if config else False,
            updated_at=config.draft_updated_at or config.updated_at if config else None,
        ))
    
    return create_response(summaries)


@router.get("/{section_config_id}", response_model=ApiResponse[SectionConfigResponse])
async def get_section_config_by_id(
    section_config_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific section configuration by ID"""
    result = await db.execute(select(SectionConfig).where(SectionConfig.id == section_config_id))
    section_config = result.scalar_one_or_none()
    
    if not section_config:
        raise HTTPException(status_code=404, detail="Section config not found")
    
    return create_response(section_config)


@router.patch("/{section_config_id}", response_model=ApiResponse[SectionConfigResponse])
async def save_draft(
    section_config_id: str,
    update_data: SectionConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Save draft data for a section config.
    Always editable - updates draft_data and sets has_unpublished_changes=true.
    """
    result = await db.execute(select(SectionConfig).where(SectionConfig.id == section_config_id))
    section_config = result.scalar_one_or_none()
    
    if not section_config:
        raise HTTPException(status_code=404, detail="Section config not found")
    
    # Store old value for audit
    old_draft_data = section_config.draft_data
    
    # Update draft data
    if update_data.draft_data is not None:
        section_config.draft_data = update_data.draft_data
        section_config.draft_updated_at = datetime.utcnow()
        section_config.draft_updated_by = current_user.uid
        section_config.has_unpublished_changes = True
    
    await db.commit()
    await db.refresh(section_config)
    
    # Log audit trail
    audit_service = AuditService(db)
    await audit_service.log_action(
        entity_type="section_config",
        entity_id=section_config.id,
        action=AuditAction.UPDATE,
        user_id=current_user.uid,
        changes={"action": "save_draft", "old_draft_data": old_draft_data, "new_draft_data": section_config.draft_data}
    )
    await db.commit()
    
    return create_response(section_config)


@router.post("/{section_config_id}/publish", response_model=ApiResponse[SectionConfigResponse])
async def publish_section_config(
    section_config_id: str,
    publish_data: SectionConfigPublish = None,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Publish section configuration to Firebase Remote Config.
    - Deploys draft_data to Firebase
    - Copies draft_data to published_data
    - Creates version snapshot in history
    - Increments published_version
    - Sets has_unpublished_changes to false
    """
    from app.services.firebase_service import get_firebase_service
    from app.models.game import Game
    import json
    
    result = await db.execute(select(SectionConfig).where(SectionConfig.id == section_config_id))
    section_config = result.scalar_one_or_none()
    
    if not section_config:
        raise HTTPException(status_code=404, detail="Section config not found")
    
    if section_config.draft_data is None:
        raise HTTPException(status_code=400, detail="Cannot publish empty config. Save draft data first.")
    
    # Get game for Firebase project ID
    game_result = await db.execute(select(Game).where(Game.id == section_config.game_id))
    game = game_result.scalar_one_or_none()
    
    if not game or not game.firebase_project_id:
        raise HTTPException(status_code=400, detail="Game does not have Firebase project configured")
    
    # Get Firebase parameter name
    param_name = SECTION_TO_FIREBASE_PARAM.get(section_config.section_type)
    if not param_name:
        raise HTTPException(status_code=400, detail=f"Unknown section type: {section_config.section_type}")
    
    # Deploy to Firebase
    try:
        from app.services.unity_transform import transform_config_to_unity
        
        firebase_service = get_firebase_service()
        
        # Transform config to Unity format before pushing to Firebase
        unity_config = transform_config_to_unity(
            section_config.section_type.value,
            section_config.draft_data
        )
        config_value = json.dumps(unity_config) if unity_config else "{}"
        
        deploy_result = await firebase_service.update_single_parameter(
            param_name=param_name,
            param_value=config_value
        )
        
        # Calculate next version
        next_version = (section_config.published_version or 0) + 1
        now = datetime.utcnow()
        
        # Create version snapshot
        version_snapshot = SectionConfigVersion(
            section_config_id=section_config.id,
            version=next_version,
            config_data=section_config.draft_data,
            published_at=now,
            published_by=current_user.uid,
            description=publish_data.description if publish_data else None,
        )
        db.add(version_snapshot)
        
        # Update section config
        section_config.published_data = section_config.draft_data
        section_config.published_version = next_version
        section_config.published_at = now
        section_config.published_by = current_user.uid
        section_config.has_unpublished_changes = False
        
        await db.commit()
        await db.refresh(section_config)
        
        # Log audit trail
        audit_service = AuditService(db)
        await audit_service.log_action(
            entity_type="section_config",
            entity_id=section_config.id,
            action=AuditAction.DEPLOY,
            user_id=current_user.uid,
            changes={
                "version": next_version,
                "firebase_param": param_name,
                "firebase_version": deploy_result.get("version_number", "unknown"),
                "description": publish_data.description if publish_data else None,
            }
        )
        await db.commit()
        
        return create_response(section_config)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to deploy to Firebase: {str(e)}")


@router.get("/{section_config_id}/versions", response_model=ApiResponse[SectionConfigVersionListResponse])
async def get_version_history(
    section_config_id: str,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """Get version history for a section config"""
    # Verify section config exists
    config_result = await db.execute(select(SectionConfig).where(SectionConfig.id == section_config_id))
    section_config = config_result.scalar_one_or_none()
    
    if not section_config:
        raise HTTPException(status_code=404, detail="Section config not found")
    
    # Get versions
    query = select(SectionConfigVersion).where(
        SectionConfigVersion.section_config_id == section_config_id
    ).order_by(desc(SectionConfigVersion.version))
    
    # Count total
    count_result = await db.execute(query)
    total = len(count_result.scalars().all())
    
    # Get paginated results
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    versions = result.scalars().all()
    
    return create_response(SectionConfigVersionListResponse(versions=versions, total=total))


@router.post("/{section_config_id}/rollback/{version}", response_model=ApiResponse[SectionConfigResponse])
async def rollback_to_version(
    section_config_id: str,
    version: int,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Rollback to a specific version.
    Copies the version's config_data to draft_data.
    User must then publish to deploy the rollback.
    """
    # Get section config
    config_result = await db.execute(select(SectionConfig).where(SectionConfig.id == section_config_id))
    section_config = config_result.scalar_one_or_none()
    
    if not section_config:
        raise HTTPException(status_code=404, detail="Section config not found")
    
    # Get the version to rollback to
    version_result = await db.execute(
        select(SectionConfigVersion).where(
            and_(
                SectionConfigVersion.section_config_id == section_config_id,
                SectionConfigVersion.version == version
            )
        )
    )
    version_snapshot = version_result.scalar_one_or_none()
    
    if not version_snapshot:
        raise HTTPException(status_code=404, detail=f"Version {version} not found")
    
    # Store old draft for audit
    old_draft_data = section_config.draft_data
    
    # Copy version data to draft
    section_config.draft_data = version_snapshot.config_data
    section_config.draft_updated_at = datetime.utcnow()
    section_config.draft_updated_by = current_user.uid
    section_config.has_unpublished_changes = True
    
    await db.commit()
    await db.refresh(section_config)
    
    # Log audit trail
    audit_service = AuditService(db)
    await audit_service.log_action(
        entity_type="section_config",
        entity_id=section_config.id,
        action=AuditAction.UPDATE,
        user_id=current_user.uid,
        changes={
            "action": "rollback",
            "rollback_to_version": version,
            "old_draft_data": old_draft_data,
            "new_draft_data": section_config.draft_data
        }
    )
    await db.commit()
    
    return create_response(section_config)
