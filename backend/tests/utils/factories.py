"""Test data factories for creating test objects"""

from typing import Optional
from app.models.user import User, UserRole
from app.models.game import Game
from app.core.auth import get_password_hash


def create_user(
    email: str = "test@example.com",
    name: str = "Test User",
    role: UserRole = UserRole.game_operator,
    password: str = "testpassword",
) -> User:
    """Factory function to create a User instance for testing."""
    return User(
        email=email,
        name=name,
        role=role,
        hashed_password=get_password_hash(password),
    )


def create_game(
    app_id: str = "test-game",
    name: str = "Test Game",
    description: Optional[str] = "A test game",
    logo_url: Optional[str] = None,
) -> Game:
    """Factory function to create a Game instance for testing."""
    return Game(
        app_id=app_id,
        name=name,
        description=description,
        logo_url=logo_url,
    )

