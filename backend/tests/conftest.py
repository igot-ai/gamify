import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from httpx import AsyncClient
from app.core.database import Base
from app.core.config import settings
from app.main import app
from app.models.game import Game


# Test database URL (use a separate test database)
TEST_DATABASE_URL = "postgresql+asyncpg://dev:devpass@localhost:5432/gamify_config_test"


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    import asyncio
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def test_engine():
    """Create a test database engine."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Drop all tables after tests
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture
async def db_session(test_engine):
    """Create a new database session for each test."""
    async_session = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def async_client(db_session):
    """Create an async HTTP client for testing API endpoints."""
    from app.core.database import get_db
    
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
    
    app.dependency_overrides.clear()


@pytest.fixture
async def test_game(db_session: AsyncSession):
    """Create a test game."""
    game = Game(
        name="Test Game",
        slug="test-game",
        description="A game for testing",
        firebase_project_id="test-project-123"
    )
    db_session.add(game)
    await db_session.commit()
    await db_session.refresh(game)
    
    return game


@pytest.fixture
async def test_game_id(test_game: Game) -> str:
    """Get test game ID."""
    return test_game.id
