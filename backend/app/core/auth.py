"""Authentication and authorization utilities"""

import logging
from enum import Enum
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


class UserRole(str, Enum):
    """User role enum for permissions"""
    DESIGNER = "designer"
    LEAD_DESIGNER = "lead_designer"
    PRODUCT_MANAGER = "product_manager"
    ADMIN = "admin"


class CurrentUser:
    """Current authenticated user information"""
    
    def __init__(
        self,
        uid: str,
        email: str,
        email_verified: bool,
        name: Optional[str] = None,
        picture: Optional[str] = None,
        role: UserRole = UserRole.DESIGNER,
    ):
        self.uid = uid
        self.email = email
        self.email_verified = email_verified
        self.name = name
        self.picture = picture
        self.role = role
    
    def has_role(self, required_role: UserRole) -> bool:
        """Check if user has required role or higher"""
        role_hierarchy = {
            UserRole.DESIGNER: 1,
            UserRole.LEAD_DESIGNER: 2,
            UserRole.PRODUCT_MANAGER: 3,
            UserRole.ADMIN: 4,
        }
        
        user_level = role_hierarchy.get(self.role, 0)
        required_level = role_hierarchy.get(required_role, 0)
        
        return user_level >= required_level


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> CurrentUser:
    """
    Verify token and return current user.
    
    This dependency extracts the Bearer token from the Authorization header
    and returns user information.
    
    Raises:
        HTTPException: If token is missing or invalid
    """
    # Development mode: allow mock authentication
    if settings.ENVIRONMENT == "development":
        if not credentials:
            logger.warning("Development mode: Using mock user authentication")
            return CurrentUser(
                uid="dev-user-123",
                email="developer@sunstudio.com",
                email_verified=True,
                name="Developer",
                role=UserRole.ADMIN,
            )
        
        # Mock token support for E2E tests
        if credentials.credentials in ["mock-token-for-e2e", "mock-token-for-testing"]:
            logger.info("Using mock token for testing")
            return CurrentUser(
                uid="test-user-id",
                email="test@sunstudio.com",
                email_verified=True,
                name="Test User",
                role=UserRole.ADMIN,
            )
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # For production, implement your own token verification here
    # For now, accept any token in development
    if settings.ENVIRONMENT == "development":
        return CurrentUser(
            uid="user-from-token",
            email="user@sunstudio.com",
            email_verified=True,
            name="Authenticated User",
            role=UserRole.ADMIN,
        )
    
    # Production: reject all tokens until proper auth is implemented
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication not configured",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[CurrentUser]:
    """
    Get current user if authenticated, otherwise return None.
    
    Useful for endpoints that work for both authenticated and anonymous users.
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


def require_role(required_role: UserRole):
    """
    Dependency factory for role-based access control.
    
    Usage:
        @router.post("/admin-only")
        async def admin_endpoint(
            current_user: CurrentUser = Depends(require_role(UserRole.ADMIN))
        ):
            ...
    """
    async def role_checker(
        current_user: CurrentUser = Depends(get_current_user)
    ) -> CurrentUser:
        if not current_user.has_role(required_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {required_role.value}",
            )
        return current_user
    
    return role_checker
