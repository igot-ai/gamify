from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_, func

from app.core.database import get_db
from app.core.response import ApiResponse, create_response
from app.core.auth import get_current_user, CurrentUser
from app.models.section_config import SectionConfig, SectionType, SectionConfigVersion
from app.schemas.section_config import (
    SectionConfigResponse,
    SectionConfigVersionCreate,
    SectionConfigVersionUpdate,
    SectionConfigVersionResponse,
    SectionConfigVersionListResponse,
    SectionConfigSummary,
)

router = APIRouter()


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
        )
        db.add(section_config)
        await db.commit()
        await db.refresh(section_config)
    
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
        
        # Count versions if config exists
        version_count = 0
        updated_at = None
        if config:
            count_result = await db.execute(
                select(func.count(SectionConfigVersion.id)).where(
                    SectionConfigVersion.section_config_id == config.id
                )
            )
            version_count = count_result.scalar() or 0
            updated_at = config.updated_at
        
        summaries.append(SectionConfigSummary(
            section_type=section_type,
            version_count=version_count,
            updated_at=updated_at,
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


# ==================== Version CRUD Endpoints ====================


@router.get("/{section_config_id}/versions", response_model=ApiResponse[SectionConfigVersionListResponse])
async def list_versions(
    section_config_id: str,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List all versions for a section config"""
    # Verify section config exists
    config_result = await db.execute(select(SectionConfig).where(SectionConfig.id == section_config_id))
    section_config = config_result.scalar_one_or_none()
    
    if not section_config:
        raise HTTPException(status_code=404, detail="Section config not found")
    
    # Get versions
    query = select(SectionConfigVersion).where(
        SectionConfigVersion.section_config_id == section_config_id
    ).order_by(desc(SectionConfigVersion.created_at))
    
    # Count total
    count_result = await db.execute(
        select(func.count(SectionConfigVersion.id)).where(
            SectionConfigVersion.section_config_id == section_config_id
        )
    )
    total = count_result.scalar() or 0
    
    # Get paginated results
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    versions = result.scalars().all()
    
    return create_response(SectionConfigVersionListResponse(versions=versions, total=total))


@router.post("/{section_config_id}/versions", response_model=ApiResponse[SectionConfigVersionResponse], status_code=status.HTTP_201_CREATED)
async def create_version(
    section_config_id: str,
    version_data: SectionConfigVersionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Create a new version for a section config"""
    # Verify section config exists
    config_result = await db.execute(select(SectionConfig).where(SectionConfig.id == section_config_id))
    section_config = config_result.scalar_one_or_none()
    
    if not section_config:
        raise HTTPException(status_code=404, detail="Section config not found")
    
    # Create new version
    version = SectionConfigVersion(
        section_config_id=section_config_id,
        title=version_data.title,
        description=version_data.description,
        experiment=version_data.experiment,
        variant=version_data.variant,
        config_data=version_data.config_data,
    )
    db.add(version)
    await db.commit()
    await db.refresh(version)
    
    return create_response(version)


@router.get("/{section_config_id}/versions/{version_id}", response_model=ApiResponse[SectionConfigVersionResponse])
async def get_version(
    section_config_id: str,
    version_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific version"""
    result = await db.execute(
        select(SectionConfigVersion).where(
            and_(
                SectionConfigVersion.section_config_id == section_config_id,
                SectionConfigVersion.id == version_id
            )
        )
    )
    version = result.scalar_one_or_none()
    
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    return create_response(version)


@router.patch("/{section_config_id}/versions/{version_id}", response_model=ApiResponse[SectionConfigVersionResponse])
async def update_version(
    section_config_id: str,
    version_id: str,
    update_data: SectionConfigVersionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Update a version (title, description, experiment, variant, config_data)"""
    result = await db.execute(
        select(SectionConfigVersion).where(
            and_(
                SectionConfigVersion.section_config_id == section_config_id,
                SectionConfigVersion.id == version_id
            )
        )
    )
    version = result.scalar_one_or_none()
    
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(version, field, value)
    
    await db.commit()
    await db.refresh(version)
    
    return create_response(version)


@router.delete("/{section_config_id}/versions/{version_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_version(
    section_config_id: str,
    version_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Delete a version"""
    result = await db.execute(
        select(SectionConfigVersion).where(
            and_(
                SectionConfigVersion.section_config_id == section_config_id,
                SectionConfigVersion.id == version_id
            )
        )
    )
    version = result.scalar_one_or_none()
    
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    await db.delete(version)
    await db.commit()
    
    return None


@router.post("/{section_config_id}/versions/{version_id}/duplicate", response_model=ApiResponse[SectionConfigVersionResponse], status_code=status.HTTP_201_CREATED)
async def duplicate_version(
    section_config_id: str,
    version_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Duplicate a version (creates a copy with the same config_data)"""
    result = await db.execute(
        select(SectionConfigVersion).where(
            and_(
                SectionConfigVersion.section_config_id == section_config_id,
                SectionConfigVersion.id == version_id
            )
        )
    )
    source_version = result.scalar_one_or_none()
    
    if not source_version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    # Create new version with copied data
    new_title = f"{source_version.title} (Copy)" if source_version.title else "Copy"
    new_version = SectionConfigVersion(
        section_config_id=section_config_id,
        title=new_title,
        description=source_version.description,
        experiment=source_version.experiment,
        variant=source_version.variant,
        config_data=source_version.config_data,
    )
    db.add(new_version)
    await db.commit()
    await db.refresh(new_version)
    
    return create_response(new_version)
