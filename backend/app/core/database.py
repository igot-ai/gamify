"""Database configuration and session management"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# Create async engine with production-ready settings
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    # Connection pool settings
    pool_size=10,  # Number of connections to maintain
    max_overflow=20,  # Maximum overflow connections
    pool_timeout=30,  # Seconds to wait before giving up on getting a connection
    pool_pre_ping=True,  # Verify connections before using (important for production)
    pool_recycle=3600,  # Recycle connections after 1 hour
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()
