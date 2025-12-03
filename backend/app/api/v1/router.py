from fastapi import APIRouter
from app.api.v1.endpoints import games, section_configs, auth, audit_logs

# Create main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(games.router, prefix="/games", tags=["Games"])
api_router.include_router(section_configs.router, prefix="/section-configs", tags=["Section Configurations"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["Audit Logs"])
