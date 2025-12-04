"""Tests for AuthService"""

import pytest
from fastapi import HTTPException

from app.services.auth_service import AuthService
from app.core.auth import get_password_hash
from app.models.user import User, UserRole


@pytest.mark.asyncio
async def test_authenticate_user_success(test_db, test_admin_user):
    """Test successful user authentication"""
    service = AuthService(test_db)
    token = await service.authenticate_user("admin@test.com", "testpassword")
    
    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 0


@pytest.mark.asyncio
async def test_authenticate_user_invalid_email(test_db):
    """Test authentication with invalid email"""
    service = AuthService(test_db)
    
    with pytest.raises(HTTPException) as exc_info:
        await service.authenticate_user("nonexistent@test.com", "testpassword")
    
    assert exc_info.value.status_code == 401
    assert "Incorrect email or password" in str(exc_info.value.detail)


@pytest.mark.asyncio
async def test_authenticate_user_invalid_password(test_db, test_admin_user):
    """Test authentication with invalid password"""
    service = AuthService(test_db)
    
    with pytest.raises(HTTPException) as exc_info:
        await service.authenticate_user("admin@test.com", "wrongpassword")
    
    assert exc_info.value.status_code == 401
    assert "Incorrect email or password" in str(exc_info.value.detail)

