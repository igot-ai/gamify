from typing import Optional, Any, List
from datetime import datetime
from pydantic import BaseModel

from app.schemas import ORMBaseModel
from app.models.section_config import SectionType


class SectionConfigResponse(ORMBaseModel):
    """Schema for section configuration response"""
    id: str
    game_id: str
    section_type: SectionType
    created_at: datetime
    updated_at: datetime


class SectionConfigVersionCreate(BaseModel):
    """Schema for creating a new version"""
    title: Optional[str] = None
    description: Optional[str] = None
    experiment: Optional[str] = None
    variant: Optional[str] = None
    config_data: Optional[Any] = None


class SectionConfigVersionUpdate(BaseModel):
    """Schema for updating a version"""
    title: Optional[str] = None
    description: Optional[str] = None
    experiment: Optional[str] = None
    variant: Optional[str] = None
    config_data: Optional[Any] = None


class SectionConfigVersionResponse(ORMBaseModel):
    """Schema for version response"""
    id: str
    section_config_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    experiment: Optional[str] = None
    variant: Optional[str] = None
    config_data: Optional[Any] = None
    created_at: datetime
    updated_at: datetime


class SectionConfigVersionListResponse(BaseModel):
    """Schema for list of versions"""
    versions: List[SectionConfigVersionResponse]
    total: int


class SectionConfigSummary(BaseModel):
    """Summary of a section config for dashboard views"""
    section_type: SectionType
    version_count: int = 0
    updated_at: Optional[datetime] = None
