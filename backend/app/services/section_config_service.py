"""Section config service - business logic for section config operations"""

from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select, desc, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import can_access_game
from app.models.user import User
from app.models.section_config import SectionConfig, SectionType, SectionConfigVersion
from app.schemas.section_config import (
    SectionConfigVersionCreate,
    SectionConfigVersionUpdate,
    SectionConfigVersionListResponse,
    SectionConfigSummary,
)


class SectionConfigService:
    """Service for section config operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def _verify_game_access(self, game_id: str, current_user: User) -> None:
        """Verify user has access to the game"""
        if not can_access_game(current_user, game_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this game"
            )
    
    async def get_or_create_config(
        self, 
        game_id: str, 
        section_type: SectionType, 
        current_user: User
    ) -> SectionConfig:
        """
        Get section config for a game+section combination.
        Auto-creates the config if it doesn't exist.
        """
        # Check game access
        self._verify_game_access(game_id, current_user)
        
        # Try to find existing config
        result = await self.db.execute(
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
            self.db.add(section_config)
            await self.db.commit()
            await self.db.refresh(section_config)
        
        return section_config
    
    async def get_config_summary(
        self, 
        game_id: str, 
        current_user: User
    ) -> List[SectionConfigSummary]:
        """Get summary of all section configs for a game"""
        # Check game access
        self._verify_game_access(game_id, current_user)
        
        summaries = []
        
        for section_type in SectionType:
            # Get config for this section type
            result = await self.db.execute(
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
                count_result = await self.db.execute(
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
        
        return summaries
    
    async def get_config_by_id(
        self, 
        config_id: str, 
        current_user: User
    ) -> SectionConfig:
        """Get a specific section config by ID"""
        result = await self.db.execute(
            select(SectionConfig).where(SectionConfig.id == config_id)
        )
        section_config = result.scalar_one_or_none()
        
        if not section_config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Section config not found"
            )
        
        # Check game access
        self._verify_game_access(section_config.game_id, current_user)
        
        return section_config
    
    async def _get_section_config(self, section_config_id: str) -> SectionConfig:
        """Helper to get section config or raise 404"""
        result = await self.db.execute(
            select(SectionConfig).where(SectionConfig.id == section_config_id)
        )
        section_config = result.scalar_one_or_none()
        
        if not section_config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Section config not found"
            )
        
        return section_config
    
    async def list_versions(
        self,
        config_id: str,
        skip: int,
        limit: int,
        current_user: User
    ) -> SectionConfigVersionListResponse:
        """List all versions for a section config"""
        section_config = await self._get_section_config(config_id)
        
        # Check game access
        self._verify_game_access(section_config.game_id, current_user)
        
        # Count total
        count_result = await self.db.execute(
            select(func.count(SectionConfigVersion.id)).where(
                SectionConfigVersion.section_config_id == config_id
            )
        )
        total = count_result.scalar() or 0
        
        # Get paginated results
        result = await self.db.execute(
            select(SectionConfigVersion)
            .where(SectionConfigVersion.section_config_id == config_id)
            .order_by(desc(SectionConfigVersion.created_at))
            .offset(skip)
            .limit(limit)
        )
        versions = list(result.scalars().all())
        
        return SectionConfigVersionListResponse(versions=versions, total=total)
    
    async def create_version(
        self,
        config_id: str,
        version_data: SectionConfigVersionCreate,
        current_user: User
    ) -> SectionConfigVersion:
        """Create a new version for a section config"""
        section_config = await self._get_section_config(config_id)
        
        # Check game access
        self._verify_game_access(section_config.game_id, current_user)
        
        # Create new version
        version = SectionConfigVersion(
            section_config_id=config_id,
            title=version_data.title,
            description=version_data.description,
            experiment=version_data.experiment,
            variant=version_data.variant,
            config_data=version_data.config_data,
        )
        self.db.add(version)
        await self.db.commit()
        await self.db.refresh(version)
        
        return version
    
    async def get_version(
        self,
        config_id: str,
        version_id: str,
        current_user: User
    ) -> SectionConfigVersion:
        """Get a specific version"""
        section_config = await self._get_section_config(config_id)
        
        # Check game access
        self._verify_game_access(section_config.game_id, current_user)
        
        # Get version
        result = await self.db.execute(
            select(SectionConfigVersion).where(
                and_(
                    SectionConfigVersion.section_config_id == config_id,
                    SectionConfigVersion.id == version_id
                )
            )
        )
        version = result.scalar_one_or_none()
        
        if not version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Version not found"
            )
        
        return version
    
    async def update_version(
        self,
        config_id: str,
        version_id: str,
        update_data: SectionConfigVersionUpdate,
        current_user: User
    ) -> SectionConfigVersion:
        """Update a version"""
        section_config = await self._get_section_config(config_id)
        
        # Check game access
        self._verify_game_access(section_config.game_id, current_user)
        
        # Get version
        result = await self.db.execute(
            select(SectionConfigVersion).where(
                and_(
                    SectionConfigVersion.section_config_id == config_id,
                    SectionConfigVersion.id == version_id
                )
            )
        )
        version = result.scalar_one_or_none()
        
        if not version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Version not found"
            )
        
        # Update fields
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(version, field, value)
        
        await self.db.commit()
        await self.db.refresh(version)
        
        return version
    
    async def delete_version(
        self,
        config_id: str,
        version_id: str,
        current_user: User
    ) -> None:
        """Delete a version"""
        section_config = await self._get_section_config(config_id)
        
        # Check game access
        self._verify_game_access(section_config.game_id, current_user)
        
        # Get version
        result = await self.db.execute(
            select(SectionConfigVersion).where(
                and_(
                    SectionConfigVersion.section_config_id == config_id,
                    SectionConfigVersion.id == version_id
                )
            )
        )
        version = result.scalar_one_or_none()
        
        if not version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Version not found"
            )
        
        await self.db.delete(version)
        await self.db.commit()
    
    async def duplicate_version(
        self,
        config_id: str,
        version_id: str,
        current_user: User
    ) -> SectionConfigVersion:
        """Duplicate a version (creates a copy with the same config_data)"""
        section_config = await self._get_section_config(config_id)
        
        # Check game access
        self._verify_game_access(section_config.game_id, current_user)
        
        # Get source version
        result = await self.db.execute(
            select(SectionConfigVersion).where(
                and_(
                    SectionConfigVersion.section_config_id == config_id,
                    SectionConfigVersion.id == version_id
                )
            )
        )
        source_version = result.scalar_one_or_none()
        
        if not source_version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Version not found"
            )
        
        # Create new version with copied data
        new_title = f"{source_version.title} (Copy)" if source_version.title else "Copy"
        new_version = SectionConfigVersion(
            section_config_id=config_id,
            title=new_title,
            description=source_version.description,
            experiment=source_version.experiment,
            variant=source_version.variant,
            config_data=source_version.config_data,
        )
        self.db.add(new_version)
        await self.db.commit()
        await self.db.refresh(new_version)
        
        return new_version

