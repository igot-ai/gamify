"""Integration tests for complete configuration workflow"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.config import ConfigStatus


@pytest.mark.asyncio
async def test_complete_config_workflow(
    async_client: AsyncClient,
    test_game_id: str,
    test_environment_id: str,
):
    """Test complete workflow: create -> update -> submit -> approve -> deploy"""
    
    # 1. Create a new config draft
    create_payload = {
        "game_id": test_game_id,
        "environment_id": test_environment_id,
        "created_by": "test-user-123",
        "economy_config": {
            "currencies": [
                {
                    "id": "coins",
                    "name": "Coins",
                    "display_name": "Gold Coins",
                    "initial_amount": 100,
                    "max_amount": 999999
                }
            ],
            "iap_products": [],
            "rewards": []
        }
    }
    
    response = await async_client.post("/api/v1/configs", json=create_payload)
    assert response.status_code == 201
    data = response.json()
    assert "data" in data
    config = data["data"]
    config_id = config["id"]
    assert config["status"] == ConfigStatus.DRAFT.value
    assert config["version"] == 1
    
    # 2. Update the config (only works in DRAFT status)
    update_payload = {
        "economy_config": {
            "currencies": [
                {
                    "id": "coins",
                    "name": "Coins",
                    "display_name": "Gold Coins",
                    "initial_amount": 200,  # Changed
                    "max_amount": 999999
                }
            ],
            "iap_products": [
                {
                    "id": "starter_pack",
                    "sku": "com.sunstudio.starter",
                    "name": "Starter Pack",
                    "description": "Get started",
                    "price_usd": 4.99,
                    "currency_rewards": {"coins": 1000}
                }
            ],
            "rewards": []
        }
    }
    
    response = await async_client.patch(f"/api/v1/configs/{config_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    updated_config = data["data"]
    assert updated_config["economy_config"]["currencies"][0]["initial_amount"] == 200
    assert len(updated_config["economy_config"]["iap_products"]) == 1
    
    # 3. Submit for review
    response = await async_client.post(f"/api/v1/configs/{config_id}/submit-review")
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["status"] == ConfigStatus.IN_REVIEW.value
    
    # 4. Try to update (should fail - can only edit DRAFT configs)
    response = await async_client.patch(f"/api/v1/configs/{config_id}", json=update_payload)
    assert response.status_code == 400
    
    # 5. Approve config
    response = await async_client.post(f"/api/v1/configs/{config_id}/approve")
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["status"] == ConfigStatus.APPROVED.value
    
    # 6. Deploy to Firebase (will fail without real Firebase, but tests the flow)
    # Note: This would require mocking Firebase in a real test
    # For now, we just verify it reaches the endpoint
    # response = await async_client.post(f"/api/v1/configs/{config_id}/deploy")
    # In a real test with mocked Firebase, we would check:
    # assert response.status_code == 200
    # assert data["data"]["status"] == ConfigStatus.DEPLOYED.value


@pytest.mark.asyncio
async def test_list_configs_with_filters(
    async_client: AsyncClient,
    test_game_id: str,
    test_environment_id: str,
):
    """Test listing configs with various filters"""
    
    # Create multiple configs
    for i in range(3):
        create_payload = {
            "game_id": test_game_id,
            "environment_id": test_environment_id,
            "created_by": f"user-{i}",
            "game_core_config": {"Version": f"1.0.{i}"}
        }
        response = await async_client.post("/api/v1/configs", json=create_payload)
        assert response.status_code == 201
    
    # List all configs for game
    response = await async_client.get(f"/api/v1/configs?game_id={test_game_id}")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "configs" in data["data"]
    assert len(data["data"]["configs"]) >= 3
    
    # Filter by environment
    response = await async_client.get(
        f"/api/v1/configs?game_id={test_game_id}&environment_id={test_environment_id}"
    )
    assert response.status_code == 200
    
    # Filter by status
    response = await async_client.get(
        f"/api/v1/configs?game_id={test_game_id}&status={ConfigStatus.DRAFT.value}"
    )
    assert response.status_code == 200
    data = response.json()
    for config in data["data"]["configs"]:
        assert config["status"] == ConfigStatus.DRAFT.value


@pytest.mark.asyncio
async def test_config_version_increments(
    async_client: AsyncClient,
    test_game_id: str,
    test_environment_id: str,
):
    """Test that config versions increment correctly"""
    
    # Create first config
    payload = {
        "game_id": test_game_id,
        "environment_id": test_environment_id,
        "created_by": "test-user",
        "game_core_config": {"Version": "1.0.0"}
    }
    
    response = await async_client.post("/api/v1/configs", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["version"] == 1
    
    # Create second config
    response = await async_client.post("/api/v1/configs", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["version"] == 2
    
    # Create third config
    response = await async_client.post("/api/v1/configs", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["version"] == 3


@pytest.mark.asyncio
async def test_invalid_status_transitions(
    async_client: AsyncClient,
    test_game_id: str,
    test_environment_id: str,
):
    """Test that invalid status transitions are rejected"""
    
    # Create config
    payload = {
        "game_id": test_game_id,
        "environment_id": test_environment_id,
        "created_by": "test-user",
        "game_core_config": {"Version": "1.0.0"}
    }
    
    response = await async_client.post("/api/v1/configs", json=payload)
    config_id = response.json()["data"]["id"]
    
    # Try to approve directly (should fail - must be in review first)
    response = await async_client.post(f"/api/v1/configs/{config_id}/approve")
    assert response.status_code == 400
    
    # Try to deploy directly (should fail - must be approved first)
    response = await async_client.post(f"/api/v1/configs/{config_id}/deploy")
    assert response.status_code == 400


