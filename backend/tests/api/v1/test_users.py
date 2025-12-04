"""Tests for users API endpoints"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_users_requires_admin(client: AsyncClient, test_admin_user):
    """Test listing users requires admin role"""
    # Login as admin
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "testpassword"}
    )
    token = login_response.json()["access_token"]
    
    # List users
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_list_users_forbidden_for_operator(client: AsyncClient, test_operator_user):
    """Test listing users is forbidden for non-admin"""
    # Login as operator
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": "operator@test.com", "password": "testpassword"}
    )
    token = login_response.json()["access_token"]
    
    # Try to list users
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_user(client: AsyncClient, test_admin_user):
    """Test creating a new user"""
    # Login as admin
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "testpassword"}
    )
    token = login_response.json()["access_token"]
    
    # Create user
    response = await client.post(
        "/api/v1/users",
        json={
            "email": "newuser@test.com",
            "name": "New User",
            "password": "password123",
            "role": "game_operator"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["name"] == "New User"
    assert data["role"] == "game_operator"


@pytest.mark.asyncio
async def test_get_user(client: AsyncClient, test_admin_user):
    """Test getting a specific user"""
    # Login as admin
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "testpassword"}
    )
    token = login_response.json()["access_token"]
    
    # Get user
    response = await client.get(
        f"/api/v1/users/{test_admin_user.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_admin_user.id
    assert data["email"] == "admin@test.com"

