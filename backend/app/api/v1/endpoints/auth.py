"""Authentication API endpoints"""

from fastapi import APIRouter, Depends

from fastapi import status

from app.api.dependencies import get_current_user, get_auth_service, get_user_service
from app.models.user import User
from app.schemas.auth import (
    CurrentUserResponse,
    LoginRequest,
    TokenResponse,
    ProfileUpdate,
)
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Authenticate user and return access token.
    Token must be sent in Authorization header: Bearer <token>
    """
    access_token = await auth_service.authenticate_user(
        login_data.email, 
        login_data.password
    )
    return TokenResponse(access_token=access_token)


@router.post("/logout")
async def logout():
    """
    Logout endpoint (client should discard the token).
    """
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=CurrentUserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user info.
    """
    return CurrentUserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        assigned_game_ids=[game.app_id for game in current_user.assigned_games]
    )


@router.patch("/me", response_model=CurrentUserResponse)
async def update_current_user_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """
    Update current user profile (name and password only).
    """
    updated_user = await user_service.update_profile(current_user.id, profile_data)
    return CurrentUserResponse(
        id=updated_user.id,
        email=updated_user.email,
        name=updated_user.name,
        role=updated_user.role,
        assigned_game_ids=[game.app_id for game in updated_user.assigned_games]
    )
