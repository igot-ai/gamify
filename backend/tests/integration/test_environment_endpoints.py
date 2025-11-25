"""Integration tests for environment management endpoints"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_game_environments(
    async_client: AsyncClient,
    test_game_id: str,
):
    """Test listing environments for a game"""
    
    response = await async_client.get(f"/api/v1/games/{test_game_id}/environments")
    assert response.status_code == 200
    
    data = response.json()
    assert "data" in data
    environments = data["data"]
    
    # Should have 3 default environments
    assert len(environments) == 3
    
    # Check environment names
    env_names = {env["name"] for env in environments}
    assert env_names == {"development", "staging", "production"}


@pytest.mark.asyncio
async def test_get_single_environment(
    async_client: AsyncClient,
    test_environment_id: str,
):
    """Test getting a single environment by ID"""
    
    response = await async_client.get(f"/api/v1/environments/{test_environment_id}")
    assert response.status_code == 200
    
    data = response.json()
    assert "data" in data
    environment = data["data"]
    
    assert environment["id"] == test_environment_id
    assert "name" in environment
    assert "game_id" in environment


@pytest.mark.asyncio
async def test_update_environment(
    async_client: AsyncClient,
    test_environment_id: str,
):
    """Test updating environment configuration"""
    
    firebase_config = {
        "api_key": "test-key",
        "project_id": "test-project",
        "app_id": "test-app"
    }
    
    response = await async_client.patch(
        f"/api/v1/environments/{test_environment_id}",
        json={"firebase_config": firebase_config}
    )
    
    assert response.status_code == 200
    data = response.json()
    environment = data["data"]
    
    assert environment["firebase_config"] == firebase_config


@pytest.mark.asyncio
async def test_get_nonexistent_environment(async_client: AsyncClient):
    """Test getting an environment that doesn't exist"""
    
    fake_id = "00000000-0000-0000-0000-000000000000"
    response = await async_client.get(f"/api/v1/environments/{fake_id}")
    
    assert response.status_code == 404
    assert "error" in response.json()


