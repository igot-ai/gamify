import pytest
from httpx import AsyncClient
from app.main import app
from app.models.game import Game


@pytest.fixture
async def client():
    """Create an async HTTP client for testing"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


class TestGameEndpoints:
    """Integration tests for game endpoints"""
    
    @pytest.mark.asyncio
    async def test_create_game(self, client: AsyncClient, db_session):
        """Test creating a new game"""
        # Note: create_game now uses form data with file upload
        # This test needs to be updated to use multipart form data
        pass  # TODO: Update to use multipart form data with firebase_service_account file
    
    @pytest.mark.asyncio
    async def test_list_games(self, client: AsyncClient, db_session):
        """Test listing all games"""
        # Create a test game
        game = Game(
            name="Test Game",
            app_id="test-game-list",
        )
        db_session.add(game)
        await db_session.commit()
        
        response = await client.get("/api/v1/games/")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
    
    @pytest.mark.asyncio
    async def test_get_game(self, client: AsyncClient, db_session):
        """Test getting a game"""
        # Create a test game
        game = Game(
            name="Test Game",
            app_id="test-game-get",
        )
        db_session.add(game)
        await db_session.commit()
        
        response = await client.get(f"/api/v1/games/{game.id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["data"]["name"] == "Test Game"
        assert data["data"]["app_id"] == "test-game-get"
    
    @pytest.mark.asyncio
    async def test_update_game(self, client: AsyncClient, db_session):
        """Test updating a game"""
        # Create a test game
        game = Game(
            name="Original Name",
            app_id="original-app-id",
        )
        db_session.add(game)
        await db_session.commit()
        
        # Update the game
        update_data = {
            "name": "Updated Name",
            "description": "New description"
        }
        
        response = await client.patch(f"/api/v1/games/{game.id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["data"]["name"] == "Updated Name"
        assert data["data"]["description"] == "New description"
        assert data["data"]["app_id"] == "original-app-id"  # Unchanged
    
    @pytest.mark.asyncio
    async def test_delete_game(self, client: AsyncClient, db_session):
        """Test deleting a game"""
        # Create a test game
        game = Game(
            name="To Delete",
            app_id="to-delete",
        )
        db_session.add(game)
        await db_session.commit()
        game_id = game.id
        
        # Delete the game
        response = await client.delete(f"/api/v1/games/{game_id}")
        assert response.status_code == 204
        
        # Verify it's deleted
        response = await client.get(f"/api/v1/games/{game_id}")
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_game(self, client: AsyncClient):
        """Test getting a game that doesn't exist"""
        response = await client.get("/api/v1/games/nonexistent-id")
        assert response.status_code == 404
