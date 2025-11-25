from fastapi import APIRouter
from app.api.v1.endpoints import games, configs, auth, environments, firebase, audit_logs

# Create main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(games.router, prefix="/games", tags=["Games"])
api_router.include_router(environments.router, tags=["Environments"])
api_router.include_router(configs.router, prefix="/configs", tags=["Configurations"])
api_router.include_router(firebase.router, prefix="/firebase", tags=["Firebase Sync"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["Audit Logs"])
