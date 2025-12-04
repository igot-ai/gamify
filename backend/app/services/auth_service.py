"""Authentication service - business logic for auth operations"""

from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.auth import create_access_token, verify_password
from app.core.config import settings
from app.models.user import User


class AuthService:
    """Service for authentication operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def authenticate_user(self, email: str, password: str) -> str:
        """
        Authenticate user by email and password.
        
        Args:
            email: User's email
            password: User's password
            
        Returns:
            Access token string
            
        Raises:
            HTTPException: If credentials are invalid
        """
        # Find user by email
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.assigned_games))
            .where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.id},
            expires_delta=access_token_expires
        )
        
        return access_token

