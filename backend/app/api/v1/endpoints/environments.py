"""Environment management endpoints"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.response import ApiResponse, create_response
from app.models.environment import Environment
from app.schemas.environment import EnvironmentResponse, EnvironmentUpdate

router = APIRouter()


@router.get("/games/{game_id}/environments", response_model=ApiResponse[List[EnvironmentResponse]])
async def list_environments(
    game_id: str,
    db: AsyncSession = Depends(get_db),
):
    """List all environments for a game"""
    result = await db.execute(
        select(Environment)
        .where(Environment.game_id == game_id)
        .order_by(Environment.created_at)
    )
    environments = result.scalars().all()
    return create_response(environments)


@router.get("/environments/{environment_id}", response_model=ApiResponse[EnvironmentResponse])
async def get_environment(
    environment_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific environment"""
    result = await db.execute(
        select(Environment).where(Environment.id == environment_id)
    )
    environment = result.scalar_one_or_none()
    
    if not environment:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    return create_response(environment)


@router.patch("/environments/{environment_id}", response_model=ApiResponse[EnvironmentResponse])
async def update_environment(
    environment_id: str,
    environment_update: EnvironmentUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update environment configuration"""
    result = await db.execute(
        select(Environment).where(Environment.id == environment_id)
    )
    environment = result.scalar_one_or_none()
    
    if not environment:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    # Update fields
    update_data = environment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(environment, field, value)
    
    await db.commit()
    await db.refresh(environment)
    
    return create_response(environment)


