"""Tests for games API endpoints"""

import pytest
from httpx import AsyncClient
from tests.utils.factories import create_game


@pytest.mark.asyncio
async def test_list_games(client: AsyncClient, test_admin_user, test_db):
    """Test listing games"""
    # Create test game
    game = create_game(app_id="test-game", name="Test Game")
    test_db.add(game)
    await test_db.commit()
    
    # Login
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "testpassword"}
    )
    token = login_response.json()["access_token"]
    
    # List games
    response = await client.get(
        "/api/v1/games",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_create_game(client: AsyncClient, test_admin_user):
    """Test creating a new game"""
    # Login as admin
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "testpassword"}
    )
    token = login_response.json()["access_token"]
    
    # Create game
    response = await client.post(
        "/api/v1/games",
        data={
            "app_id": "new-game",
            "name": "New Game",
            "description": "A new game"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["app_id"] == "new-game"
    assert data["name"] == "New Game"


@pytest.mark.asyncio
async def test_get_game(client: AsyncClient, test_admin_user, test_db):
    """Test getting a specific game"""
    # Create test game
    game = create_game(app_id="get-test", name="Get Test Game")
    test_db.add(game)
    await test_db.commit()
    
    # Login
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "testpassword"}
    )
    token = login_response.json()["access_token"]
    
    # Get game
    response = await client.get(
        "/api/v1/games/get-test",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["app_id"] == "get-test"
    assert data["name"] == "Get Test Game"


@pytest.mark.asyncio
async def test_update_game(client: AsyncClient, test_admin_user, test_db):
    """Test updating a game"""
    # Create test game
    game = create_game(app_id="update-test", name="Original Name")
    test_db.add(game)
    await test_db.commit()
    
    # Login
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "testpassword"}
    )
    token = login_response.json()["access_token"]
    
    # Update game
    response = await client.patch(
        "/api/v1/games/update-test",
        json={"name": "Updated Name", "description": "Updated Description"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "Updated Description"

