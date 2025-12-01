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
        game_data = {
            "name": "Tile Adventure",
            "slug": "tile-adventure",
            "firebase_project_id": "sunstudio-tile-adventure",
            "description": "A fun tile matching game"
        }
        
        response = await client.post("/api/v1/games/", json=game_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == "Tile Adventure"
        assert data["slug"] == "tile-adventure"
        assert "id" in data
        assert "created_at" in data
    
    @pytest.mark.asyncio
    async def test_list_games(self, client: AsyncClient, db_session):
        """Test listing all games"""
        # Create a test game
        game = Game(
            name="Test Game",
            slug="test-game",
            firebase_project_id="test-project"
        )
        db_session.add(game)
        await db_session.commit()
        
        response = await client.get("/api/v1/games/")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    @pytest.mark.asyncio
    async def test_get_game(self, client: AsyncClient, db_session):
        """Test getting a game"""
        # Create a test game
        game = Game(
            name="Test Game",
            slug="test-game-get",
            firebase_project_id="test-project"
        )
        db_session.add(game)
        await db_session.commit()
        
        response = await client.get(f"/api/v1/games/{game.id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "Test Game"
    
    @pytest.mark.asyncio
    async def test_update_game(self, client: AsyncClient, db_session):
        """Test updating a game"""
        # Create a test game
        game = Game(
            name="Original Name",
            slug="original-slug",
            firebase_project_id="original-project"
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
        assert data["name"] == "Updated Name"
        assert data["description"] == "New description"
        assert data["slug"] == "original-slug"  # Unchanged
    
    @pytest.mark.asyncio
    async def test_delete_game(self, client: AsyncClient, db_session):
        """Test deleting a game"""
        # Create a test game
        game = Game(
            name="To Delete",
            slug="to-delete",
            firebase_project_id="delete-project"
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
