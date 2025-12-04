"""Service dependency injection factories"""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.common import get_db


def get_auth_service(db: AsyncSession = Depends(get_db)):
    """Get AuthService instance with database session"""
    from app.services.auth_service import AuthService
    return AuthService(db)


def get_user_service(db: AsyncSession = Depends(get_db)):
    """Get UserService instance with database session"""
    from app.services.user_service import UserService
    return UserService(db)


def get_game_service(db: AsyncSession = Depends(get_db)):
    """Get GameService instance with database session"""
    from app.services.game_service import GameService
    return GameService(db)


def get_section_config_service(db: AsyncSession = Depends(get_db)):
    """Get SectionConfigService instance with database session"""
    from app.services.section_config_service import SectionConfigService
    return SectionConfigService(db)

