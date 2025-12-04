"""API v1 router configuration"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth_router,
    games_router,
    section_configs_router,
    users_router,
)

# Create main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(games_router, prefix="/games", tags=["Games"])
api_router.include_router(section_configs_router, prefix="/section-configs", tags=["Section Configurations"])
