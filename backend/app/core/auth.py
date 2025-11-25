"""Authentication and authorization utilities"""

import logging
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth

from app.core.config import settings
from app.core.firebase import get_firebase_app
from app.models.user import UserRole

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


class CurrentUser:
    """Current authenticated user information"""
    
    def __init__(
        self,
        uid: str,
        email: str,
        email_verified: bool,
        name: Optional[str] = None,
        picture: Optional[str] = None,
        role: UserRole = UserRole.GAME_DESIGNER,
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
            UserRole.GAME_DESIGNER: 1,
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
    Verify Firebase ID token and return current user.
    
    This dependency extracts the Bearer token from the Authorization header,
    verifies it with Firebase Auth, and returns user information.
    
    Raises:
        HTTPException: If token is missing, invalid, or expired
    """
    # If in development mode and no credentials, return mock user
    if settings.ENVIRONMENT == "development" and not credentials:
        logger.warning("Development mode: Using mock user authentication")
        return CurrentUser(
            uid="dev-user-123",
            email="developer@sunstudio.com",
            email_verified=True,
            name="Developer",
            role=UserRole.ADMIN,
        )
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Get Firebase app instance
        get_firebase_app()
        
        # Verify the ID token
        decoded_token = auth.verify_id_token(credentials.credentials)
        
        # Extract user information
        uid = decoded_token["uid"]
        email = decoded_token.get("email", "")
        email_verified = decoded_token.get("email_verified", False)
        name = decoded_token.get("name")
        picture = decoded_token.get("picture")
        
        # TODO: Fetch user role from database based on uid
        # For now, default to GAME_DESIGNER
        role = UserRole.GAME_DESIGNER
        
        logger.info(f"User authenticated: {email} (uid: {uid})")
        
        return CurrentUser(
            uid=uid,
            email=email,
            email_verified=email_verified,
            name=name,
            picture=picture,
            role=role,
        )
    
    except auth.InvalidIdTokenError:
        logger.warning("Invalid Firebase ID token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError:
        logger.warning("Expired Firebase ID token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
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


