"""Tests for GameService"""

import pytest
from fastapi import HTTPException

from app.services.game_service import GameService
from app.schemas.game import GameUpdate
from app.models.user import UserRole
from tests.utils.factories import create_game


@pytest.mark.asyncio
async def test_list_games_admin_sees_all(test_db, test_admin_user):
    """Test admin can see all games"""
    service = GameService(test_db)
    
    # Create test games
    game1 = create_game(app_id="game1", name="Game 1")
    game2 = create_game(app_id="game2", name="Game 2")
    test_db.add(game1)
    test_db.add(game2)
    await test_db.commit()
    
    games = await service.list_games(test_admin_user, skip=0, limit=100)
    
    assert len(games) >= 2
    app_ids = [g.app_id for g in games]
    assert "game1" in app_ids
    assert "game2" in app_ids


@pytest.mark.asyncio
async def test_list_games_operator_sees_only_assigned(test_db, test_operator_user):
    """Test operator only sees assigned games"""
    from sqlalchemy.orm import selectinload
    
    service = GameService(test_db)
    
    # Create games
    game1 = create_game(app_id="assigned-game", name="Assigned Game")
    game2 = create_game(app_id="unassigned-game", name="Unassigned Game")
    test_db.add(game1)
    test_db.add(game2)
    await test_db.flush()
    
    # Assign one game to operator (need to reload user with relationship)
    from sqlalchemy import select
    from app.models.user import User
    result = await test_db.execute(
        select(User)
        .options(selectinload(User.assigned_games))
        .where(User.id == test_operator_user.id)
    )
    user = result.scalar_one()
    user.assigned_games.append(game1)
    await test_db.commit()
    
    games = await service.list_games(user, skip=0, limit=100)
    
    assert len(games) == 1
    assert games[0].app_id == "assigned-game"


@pytest.mark.asyncio
async def test_get_game_success(test_db, test_admin_user):
    """Test getting a game by app_id"""
    service = GameService(test_db)
    
    game = create_game(app_id="test-game", name="Test Game")
    test_db.add(game)
    await test_db.commit()
    
    retrieved_game = await service.get_game("test-game", test_admin_user)
    
    assert retrieved_game is not None
    assert retrieved_game.app_id == "test-game"
    assert retrieved_game.name == "Test Game"


@pytest.mark.asyncio
async def test_get_game_not_found(test_db, test_admin_user):
    """Test getting a non-existent game"""
    service = GameService(test_db)
    
    with pytest.raises(HTTPException) as exc_info:
        await service.get_game("non-existent", test_admin_user)
    
    assert exc_info.value.status_code == 404
    assert "Game not found" in str(exc_info.value.detail)


@pytest.mark.asyncio
async def test_create_game(test_db):
    """Test creating a new game"""
    service = GameService(test_db)
    
    game = await service.create_game("new-game", "New Game", "Description", None)
    
    assert game is not None
    assert game.app_id == "new-game"
    assert game.name == "New Game"
    assert game.description == "Description"


@pytest.mark.asyncio
async def test_update_game(test_db, test_admin_user):
    """Test updating a game"""
    service = GameService(test_db)
    
    game = create_game(app_id="update-test", name="Original Name")
    test_db.add(game)
    await test_db.commit()
    
    update_data = GameUpdate(name="Updated Name", description="New Description")
    updated_game = await service.update_game("update-test", update_data, test_admin_user)
    
    assert updated_game.name == "Updated Name"
    assert updated_game.description == "New Description"

