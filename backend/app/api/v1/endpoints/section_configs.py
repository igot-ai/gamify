"""Section Configs API endpoints"""

from typing import List

from fastapi import APIRouter, Depends, status, Query

from app.api.dependencies import get_current_user, get_section_config_service
from app.models.user import User
from app.models.section_config import SectionType
from app.schemas.section_config import (
    SectionConfigResponse,
    SectionConfigVersionCreate,
    SectionConfigVersionUpdate,
    SectionConfigVersionResponse,
    SectionConfigVersionListResponse,
    SectionConfigSummary,
)
from app.services.section_config_service import SectionConfigService

router = APIRouter()


@router.get("", response_model=SectionConfigResponse)
async def get_or_create_section_config(
    game_id: str = Query(..., description="Game ID"),
    section_type: SectionType = Query(..., description="Section type"),
    current_user: User = Depends(get_current_user),
    service: SectionConfigService = Depends(get_section_config_service)
):
    """
    Get section config for a game+section combination.
    Auto-creates the config if it doesn't exist (one record per game+section).
    """
    config = await service.get_or_create_config(game_id, section_type, current_user)
    return config


@router.get("/summary", response_model=List[SectionConfigSummary])
async def get_section_configs_summary(
    game_id: str = Query(..., description="Game ID"),
    current_user: User = Depends(get_current_user),
    service: SectionConfigService = Depends(get_section_config_service)
):
    """Get summary of all section configs for a game"""
    summaries = await service.get_config_summary(game_id, current_user)
    return summaries


@router.get("/{section_config_id}", response_model=SectionConfigResponse)
async def get_section_config_by_id(
    section_config_id: str,
    current_user: User = Depends(get_current_user),
    service: SectionConfigService = Depends(get_section_config_service)
):
    """Get a specific section configuration by ID"""
    config = await service.get_config_by_id(section_config_id, current_user)
    return config


# ==================== Version CRUD Endpoints ====================


@router.get("/{section_config_id}/versions", response_model=SectionConfigVersionListResponse)
async def list_versions(
    section_config_id: str,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    service: SectionConfigService = Depends(get_section_config_service)
):
    """List all versions for a section config"""
    result = await service.list_versions(section_config_id, skip, limit, current_user)
    return result


@router.post("/{section_config_id}/versions", response_model=SectionConfigVersionResponse, status_code=status.HTTP_201_CREATED)
async def create_version(
    section_config_id: str,
    version_data: SectionConfigVersionCreate,
    current_user: User = Depends(get_current_user),
    service: SectionConfigService = Depends(get_section_config_service)
):
    """Create a new version for a section config"""
    version = await service.create_version(section_config_id, version_data, current_user)
    return version


@router.get("/{section_config_id}/versions/{version_id}", response_model=SectionConfigVersionResponse)
async def get_version(
    section_config_id: str,
    version_id: str,
    current_user: User = Depends(get_current_user),
    service: SectionConfigService = Depends(get_section_config_service)
):
    """Get a specific version"""
    version = await service.get_version(section_config_id, version_id, current_user)
    return version


@router.patch("/{section_config_id}/versions/{version_id}", response_model=SectionConfigVersionResponse)
async def update_version(
    section_config_id: str,
    version_id: str,
    update_data: SectionConfigVersionUpdate,
    current_user: User = Depends(get_current_user),
    service: SectionConfigService = Depends(get_section_config_service)
):
    """Update a version (title, description, experiment, variant, config_data)"""
    version = await service.update_version(section_config_id, version_id, update_data, current_user)
    return version


@router.delete("/{section_config_id}/versions/{version_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_version(
    section_config_id: str,
    version_id: str,
    current_user: User = Depends(get_current_user),
    service: SectionConfigService = Depends(get_section_config_service)
):
    """Delete a version"""
    await service.delete_version(section_config_id, version_id, current_user)


@router.post("/{section_config_id}/versions/{version_id}/duplicate", response_model=SectionConfigVersionResponse, status_code=status.HTTP_201_CREATED)
async def duplicate_version(
    section_config_id: str,
    version_id: str,
    current_user: User = Depends(get_current_user),
    service: SectionConfigService = Depends(get_section_config_service)
):
    """Duplicate a version (creates a copy with the same config_data)"""
    version = await service.duplicate_version(section_config_id, version_id, current_user)
    return version
