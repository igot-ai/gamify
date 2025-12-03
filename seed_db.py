import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.config import settings
from app.models.game import Game
from app.models.environment import Environment

async def seed_data():
    print("Seeding database...")
    
    # Connect to DB
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check/Create Test Game
        result = await session.execute(select(Game).where(Game.app_id == "tile-adventure"))
        game = result.scalar_one_or_none()
        
        if not game:
            print("Creating test game...")
            game = Game(
                name="Tile Adventure",
                app_id="tile-adventure",
                description="A matching puzzle game"
            )
            session.add(game)
            await session.flush()
            
            # Create environments
            for env_name in ["development", "staging", "production"]:
                env = Environment(name=env_name, game_id=game.id)
                session.add(env)
        else:
            print("Test game exists.")
            
        await session.commit()
        print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())


