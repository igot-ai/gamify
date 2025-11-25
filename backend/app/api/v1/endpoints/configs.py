from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.response import ApiResponse, create_response
from app.core.auth import get_current_user, require_role, CurrentUser
from app.models.config import Config, ConfigStatus
from app.models.user import UserRole
from app.models.audit_log import AuditAction
from app.schemas.config import ConfigCreate, ConfigUpdate, ConfigResponse, ConfigListResponse
from app.services.audit_service import AuditService

router = APIRouter()


@router.get("", response_model=ApiResponse[ConfigListResponse])
async def list_configs(
    game_id: str = Query(..., description="Game ID filter"),
    environment_id: Optional[str] = Query(None),
    status: Optional[ConfigStatus] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List configurations with filters"""
    query = select(Config).where(Config.game_id == game_id)
    
    if environment_id:
        query = query.where(Config.environment_id == environment_id)
    if status:
        query = query.where(Config.status == status)
    
    # Count total
    count_result = await db.execute(query)
    total = len(count_result.scalars().all())
    
    # Get paginated results
    query = query.offset(skip).limit(limit).order_by(desc(Config.created_at))
    result = await db.execute(query)
    configs = result.scalars().all()
    
    return create_response(ConfigListResponse(configs=configs, total=total))


@router.get("/{config_id}", response_model=ApiResponse[ConfigResponse])
async def get_config(
    config_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific configuration by ID"""
    result = await db.execute(select(Config).where(Config.id == config_id))
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    
    return create_response(config)


@router.post("", response_model=ApiResponse[ConfigResponse], status_code=status.HTTP_201_CREATED)
async def create_config(
    config_in: ConfigCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Create a new configuration draft"""
    # Get next version number
    result = await db.execute(
        select(Config.version)
        .where(Config.game_id == config_in.game_id)
        .order_by(desc(Config.version))
        .limit(1)
    )
    latest_version = result.scalar()
    next_version = (latest_version or 0) + 1
    
    # Create config
    config_data = config_in.dict()
    config = Config(
        version=next_version,
        created_by=current_user.uid,
        **config_data
    )
    
    db.add(config)
    await db.commit()
    await db.refresh(config)
    
    # Log audit trail
    audit_service = AuditService(db)
    await audit_service.log_config_created(
        config_id=config.id,
        user_id=current_user.uid,
        game_id=config.game_id,
        environment_id=config.environment_id or ""
    )
    await db.commit()
    
    return create_response(config)


@router.patch("/{config_id}", response_model=ApiResponse[ConfigResponse])
async def update_config(
    config_id: str,
    config_update: ConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Update a configuration (only in DRAFT status)"""
    result = await db.execute(select(Config).where(Config.id == config_id))
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    
    if config.status != ConfigStatus.DRAFT:
        raise HTTPException(
            status_code=400,
            detail="Can only edit configs in DRAFT status"
        )
    
    # Store old values for audit
    old_values = {
        "economy_config": config.economy_config,
        "ad_config": config.ad_config,
        "notification_config": config.notification_config,
    }
    
    # Update fields
    update_data = config_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    
    config.updated_by = current_user.uid
    
    await db.commit()
    await db.refresh(config)
    
    # Log audit trail
    changes = {k: {"old": old_values.get(k), "new": getattr(config, k)} for k in update_data.keys()}
    audit_service = AuditService(db)
    await audit_service.log_config_updated(
        config_id=config.id,
        user_id=current_user.uid,
        changes=changes
    )
    await db.commit()
    
    return create_response(config)


@router.post("/{config_id}/submit-review", response_model=ApiResponse[ConfigResponse])
async def submit_for_review(
    config_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Submit configuration for review"""
    result = await db.execute(select(Config).where(Config.id == config_id))
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    
    if config.status != ConfigStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Can only submit DRAFT configs for review")
    
    old_status = config.status
    config.status = ConfigStatus.IN_REVIEW
    await db.commit()
    await db.refresh(config)
    
    # Log audit trail
    audit_service = AuditService(db)
    await audit_service.log_config_status_change(
        config_id=config.id,
        user_id=current_user.uid,
        old_status=old_status,
        new_status=config.status
    )
    await db.commit()
    
    return create_response(config)


@router.post("/{config_id}/approve", response_model=ApiResponse[ConfigResponse])
async def approve_config(
    config_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_role(UserRole.LEAD_DESIGNER)),
):
    """Approve a configuration (requires LEAD_DESIGNER or higher)"""
    from datetime import datetime
    
    result = await db.execute(select(Config).where(Config.id == config_id))
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    
    if config.status != ConfigStatus.IN_REVIEW:
        raise HTTPException(status_code=400, detail="Can only approve IN_REVIEW configs")
    
    old_status = config.status
    config.status = ConfigStatus.APPROVED
    config.approved_by = current_user.uid
    config.approved_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(config)
    
    # Log audit trail
    audit_service = AuditService(db)
    await audit_service.log_config_status_change(
        config_id=config.id,
        user_id=current_user.uid,
        old_status=old_status,
        new_status=config.status
    )
    await db.commit()
    
    return create_response(config)


@router.post("/{config_id}/deploy", response_model=ApiResponse[ConfigResponse])
async def deploy_config(
    config_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_role(UserRole.PRODUCT_MANAGER)),
):
    """Deploy configuration to Firebase Remote Config"""
    from app.services.firebase_service import get_firebase_service
    from app.services.config_converter import get_config_converter
    from datetime import datetime
    
    result = await db.execute(select(Config).where(Config.id == config_id))
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    
    if config.status != ConfigStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Can only deploy APPROVED configs")
    
    # Convert config to Firebase format
    converter = get_config_converter()
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
    
    # Validate config before deployment
    is_valid, error_msg = converter.validate_portal_config(config_dict)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Invalid config: {error_msg}")
    
    # Convert to Firebase format
    firebase_params = converter.portal_to_firebase(config_dict)
    
    # Deploy to Firebase
    try:
        firebase_service = get_firebase_service()
        result = await firebase_service.update_template(firebase_params)
        
        # Update config status
        old_status = config.status
        config.status = ConfigStatus.DEPLOYED
        config.deployed_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(config)
        
        # Log audit trail
        audit_service = AuditService(db)
        await audit_service.log_config_deployed(
            config_id=config.id,
            user_id=current_user.uid,
            firebase_version=result.get("version_number", "unknown")
        )
        await db.commit()
        
        return create_response(config)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to deploy to Firebase: {str(e)}")
