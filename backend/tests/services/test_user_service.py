"""Tests for UserService"""

import pytest
from fastapi import HTTPException

from app.services.user_service import UserService
from app.schemas.auth import UserCreate, UserUpdate
from app.models.user import UserRole


@pytest.mark.asyncio
async def test_list_users(test_db, test_admin_user, test_operator_user):
    """Test listing all users"""
    service = UserService(test_db)
    users = await service.list_users()
    
    assert len(users) >= 2
    assert any(u.email == "admin@test.com" for u in users)
    assert any(u.email == "operator@test.com" for u in users)


@pytest.mark.asyncio
async def test_get_user_success(test_db, test_admin_user):
    """Test getting a user by ID"""
    service = UserService(test_db)
    user = await service.get_user(test_admin_user.id)
    
    assert user is not None
    assert user.id == test_admin_user.id
    assert user.email == "admin@test.com"
    assert user.role == UserRole.admin


@pytest.mark.asyncio
async def test_get_user_not_found(test_db):
    """Test getting a non-existent user"""
    service = UserService(test_db)
    
    with pytest.raises(HTTPException) as exc_info:
        await service.get_user("non-existent-id")
    
    assert exc_info.value.status_code == 404
    assert "User not found" in str(exc_info.value.detail)


@pytest.mark.asyncio
async def test_create_user(test_db):
    """Test creating a new user"""
    service = UserService(test_db)
    user_data = UserCreate(
        email="newuser@test.com",
        name="New User",
        password="password123",
        role=UserRole.game_operator
    )
    
    user = await service.create_user(user_data)
    
    assert user is not None
    assert user.email == "newuser@test.com"
    assert user.name == "New User"
    assert user.role == UserRole.game_operator


@pytest.mark.asyncio
async def test_update_user(test_db, test_admin_user):
    """Test updating a user"""
    service = UserService(test_db)
    update_data = UserUpdate(name="Updated Name", role=UserRole.game_operator)
    
    updated_user = await service.update_user(test_admin_user.id, update_data)
    
    assert updated_user.name == "Updated Name"
    assert updated_user.role == UserRole.game_operator
    assert updated_user.email == test_admin_user.email  # Email shouldn't change

