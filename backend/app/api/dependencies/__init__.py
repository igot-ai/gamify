"""API Dependencies - FastAPI dependency injection"""

from app.api.dependencies.common import get_db
from app.api.dependencies.auth import (
    get_current_user,
    require_admin,
    can_access_game,
)
from app.api.dependencies.services import (
    get_auth_service,
    get_user_service,
    get_game_service,
    get_section_config_service,
)

__all__ = [
    # Database
    "get_db",
    # Auth
    "get_current_user",
    "require_admin",
    "can_access_game",
    # Services
    "get_auth_service",
    "get_user_service",
    "get_game_service",
    "get_section_config_service",
]

