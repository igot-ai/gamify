"""API v1 endpoint routers"""

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.games import router as games_router
from app.api.v1.endpoints.section_configs import router as section_configs_router
from app.api.v1.endpoints.users import router as users_router

__all__ = [
    "auth_router",
    "games_router",
    "section_configs_router",
    "users_router",
]

