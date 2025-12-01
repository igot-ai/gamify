"""Integration tests for section configuration workflow"""

import pytest
from httpx import AsyncClient

from app.models.section_config import SectionType


@pytest.mark.asyncio
async def test_get_or_create_section_config(
    async_client: AsyncClient,
    test_game_id: str,
):
    """Test that GET auto-creates section config if it doesn't exist"""
    
    # Get config for economy section (should auto-create)
    response = await async_client.get(
        f"/api/v1/section-configs?game_id={test_game_id}&section_type=economy"
    )
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    config = data["data"]
    
    # Should have correct structure
    assert config["game_id"] == test_game_id
    assert config["section_type"] == "economy"
    assert config["draft_data"] is None
    assert config["published_data"] is None
    assert config["published_version"] is None
    assert config["has_unpublished_changes"] is False
    
    config_id = config["id"]
    
    # Getting again should return the same config
    response = await async_client.get(
        f"/api/v1/section-configs?game_id={test_game_id}&section_type=economy"
    )
    assert response.status_code == 200
    assert response.json()["data"]["id"] == config_id


@pytest.mark.asyncio
async def test_save_draft(
    async_client: AsyncClient,
    test_game_id: str,
):
    """Test saving draft data"""
    
    # Get/create config
    response = await async_client.get(
        f"/api/v1/section-configs?game_id={test_game_id}&section_type=ads"
    )
    config_id = response.json()["data"]["id"]
    
    # Save draft
    draft_data = {
        "networks": [
            {"id": "admob", "enabled": True}
        ],
        "placements": []
    }
    
    response = await async_client.patch(
        f"/api/v1/section-configs/{config_id}",
        json={"draft_data": draft_data}
    )
    assert response.status_code == 200
    data = response.json()["data"]
    
    assert data["draft_data"] == draft_data
    assert data["has_unpublished_changes"] is True
    assert data["draft_updated_at"] is not None
    
    # Published data should still be None
    assert data["published_data"] is None
    assert data["published_version"] is None


@pytest.mark.asyncio
async def test_save_draft_always_editable(
    async_client: AsyncClient,
    test_game_id: str,
):
    """Test that draft can always be saved (no status restrictions)"""
    
    # Get/create config
    response = await async_client.get(
        f"/api/v1/section-configs?game_id={test_game_id}&section_type=notification"
    )
    config_id = response.json()["data"]["id"]
    
    # Save draft multiple times
    for i in range(3):
        draft_data = {"strategies": [{"id": f"strategy-{i}"}]}
        response = await async_client.patch(
            f"/api/v1/section-configs/{config_id}",
            json={"draft_data": draft_data}
        )
        assert response.status_code == 200
        assert response.json()["data"]["draft_data"] == draft_data


@pytest.mark.asyncio
async def test_section_config_summary(
    async_client: AsyncClient,
    test_game_id: str,
):
    """Test getting section config summary for a game"""
    
    # Get summary
    response = await async_client.get(f"/api/v1/section-configs/summary?game_id={test_game_id}")
    assert response.status_code == 200
    data = response.json()
    
    # Should have entries for all section types
    assert "data" in data
    summaries = data["data"]
    assert len(summaries) == len(SectionType)
    
    # Each summary should have the expected fields
    for summary in summaries:
        assert "section_type" in summary
        assert "published_version" in summary
        assert "has_unpublished_changes" in summary
        assert "updated_at" in summary


@pytest.mark.asyncio
async def test_get_config_by_id(
    async_client: AsyncClient,
    test_game_id: str,
):
    """Test getting config by ID"""
    
    # Get/create config
    response = await async_client.get(
        f"/api/v1/section-configs?game_id={test_game_id}&section_type=shop"
    )
    config_id = response.json()["data"]["id"]
    
    # Get by ID
    response = await async_client.get(f"/api/v1/section-configs/{config_id}")
    assert response.status_code == 200
    assert response.json()["data"]["id"] == config_id


@pytest.mark.asyncio
async def test_get_nonexistent_config_by_id(
    async_client: AsyncClient,
):
    """Test getting nonexistent config returns 404"""
    
    response = await async_client.get("/api/v1/section-configs/nonexistent-id")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_version_history_empty(
    async_client: AsyncClient,
    test_game_id: str,
):
    """Test version history is empty for unpublished config"""
    
    # Get/create config
    response = await async_client.get(
        f"/api/v1/section-configs?game_id={test_game_id}&section_type=booster"
    )
    config_id = response.json()["data"]["id"]
    
    # Get version history
    response = await async_client.get(f"/api/v1/section-configs/{config_id}/versions")
    assert response.status_code == 200
    data = response.json()["data"]
    
    assert "versions" in data
    assert "total" in data
    assert data["total"] == 0
    assert len(data["versions"]) == 0


# Note: Publish and rollback tests require mocking Firebase service
# They would be tested in a separate test file with proper mocking

@pytest.mark.asyncio
async def test_publish_requires_draft_data(
    async_client: AsyncClient,
    test_game_id: str,
):
    """Test that publish fails if draft_data is empty"""
    
    # Get/create config (with empty draft)
    response = await async_client.get(
        f"/api/v1/section-configs?game_id={test_game_id}&section_type=chapter_reward"
    )
    config_id = response.json()["data"]["id"]
    
    # Try to publish without draft data
    response = await async_client.post(f"/api/v1/section-configs/{config_id}/publish")
    assert response.status_code == 400
    assert "empty config" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_rollback_requires_valid_version(
    async_client: AsyncClient,
    test_game_id: str,
):
    """Test that rollback fails if version doesn't exist"""
    
    # Get/create config
    response = await async_client.get(
        f"/api/v1/section-configs?game_id={test_game_id}&section_type=analytics"
    )
    config_id = response.json()["data"]["id"]
    
    # Try to rollback to nonexistent version
    response = await async_client.post(f"/api/v1/section-configs/{config_id}/rollback/999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
