"""Authentication dependencies for API endpoints"""

import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies.common import get_db
from app.core.auth import decode_access_token
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)

# Security scheme for bearer token - auto_error=False to handle missing token ourselves
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token in Authorization header.
    
    Token must be provided via Authorization header: Bearer <token>
    """
    # Check if credentials are provided
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # Decode token
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database with assigned games loaded
    result = await db.execute(
        select(User)
        .options(selectinload(User.assigned_games))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency that requires the current user to be an admin.
    
    Usage:
        @router.post("/admin-only")
        async def admin_endpoint(current_user: User = Depends(require_admin)):
            ...
    """
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def can_access_game(user: User, app_id: str) -> bool:
    """
    Check if a user can access a specific game.
    
    - Admins can access all games
    - Game operators can only access their assigned games
    
    Args:
        user: The user to check access for
        app_id: The game's app_id (primary key)
    """
    if user.role == UserRole.admin:
        return True
    
    # Check if game is in user's assigned games (using app_id as PK)
    return any(game.app_id == app_id for game in user.assigned_games)


