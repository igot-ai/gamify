from typing import Optional, Any, List
from datetime import datetime
from pydantic import BaseModel
from app.models.section_config import SectionType


class SectionConfigUpdate(BaseModel):
    """Schema for saving draft data"""
    draft_data: Optional[Any] = None


class SectionConfigPublish(BaseModel):
    """Schema for publishing a config"""
    description: Optional[str] = None  # Optional publish note


class SectionConfigRollback(BaseModel):
    """Schema for rollback request"""
    version: int


class SectionConfigResponse(BaseModel):
    """Schema for section configuration response"""
    id: str
    game_id: str
    section_type: SectionType
    
    # Draft state (always editable)
    draft_data: Optional[Any] = None
    draft_updated_at: Optional[datetime] = None
    draft_updated_by: Optional[str] = None
    
    # Published state (null if never published)
    published_data: Optional[Any] = None
    published_version: Optional[int] = None
    published_at: Optional[datetime] = None
    published_by: Optional[str] = None
    
    # Dirty flag
    has_unpublished_changes: bool = False
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SectionConfigVersionResponse(BaseModel):
    """Schema for version history item"""
    id: str
    version: int
    config_data: Optional[Any] = None
    published_at: datetime
    published_by: str
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class SectionConfigVersionListResponse(BaseModel):
    """Schema for list of version history"""
    versions: List[SectionConfigVersionResponse]
    total: int


class SectionConfigSummary(BaseModel):
    """Summary of a section config for dashboard views"""
    section_type: SectionType
    published_version: Optional[int] = None
    has_unpublished_changes: bool = False
    updated_at: Optional[datetime] = None
