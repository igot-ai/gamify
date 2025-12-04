"""Users API endpoints"""

from typing import List

from fastapi import APIRouter, Depends, status

from app.api.dependencies import require_admin, get_user_service
from app.models.user import User
from app.schemas.auth import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
)
from app.services.user_service import UserService

router = APIRouter()


@router.get("", response_model=List[UserListResponse])
async def list_users(
    current_user: User = Depends(require_admin),
    user_service: UserService = Depends(get_user_service)
):
    """List all users. Admin only."""
    users = await user_service.list_users()
    return users


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin),
    user_service: UserService = Depends(get_user_service)
):
    """Create a new user. Admin only."""
    user = await user_service.create_user(user_data)
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(require_admin),
    user_service: UserService = Depends(get_user_service)
):
    """Get a specific user by ID. Admin only."""
    user = await user_service.get_user(user_id)
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(require_admin),
    user_service: UserService = Depends(get_user_service)
):
    """Update a user. Admin only."""
    user = await user_service.update_user(user_id, user_data)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: User = Depends(require_admin),
    user_service: UserService = Depends(get_user_service)
):
    """Delete a user. Admin only. Cannot delete yourself."""
    await user_service.delete_user(user_id, current_user.id)


@router.post("/{user_id}/games/{app_id}", response_model=UserResponse)
async def assign_game_to_user(
    user_id: str,
    app_id: str,
    current_user: User = Depends(require_admin),
    user_service: UserService = Depends(get_user_service)
):
    """Assign a game to a user (for game operators). Admin only."""
    user = await user_service.assign_game(user_id, app_id)
    return user


@router.delete("/{user_id}/games/{app_id}", response_model=UserResponse)
async def remove_game_from_user(
    user_id: str,
    app_id: str,
    current_user: User = Depends(require_admin),
    user_service: UserService = Depends(get_user_service)
):
    """Remove a game assignment from a user. Admin only."""
    user = await user_service.remove_game(user_id, app_id)
    return user
