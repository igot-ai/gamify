"""Audit log endpoints"""

from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.response import ApiResponse, create_response
from app.services.audit_service import get_audit_service
from app.schemas.audit_log import AuditLogResponse

router = APIRouter()


@router.get("/", response_model=ApiResponse[List[AuditLogResponse]])
async def list_audit_logs(
    entity_type: str = Query(None, description="Filter by entity type"),
    entity_id: str = Query(None, description="Filter by entity ID"),
    user_id: str = Query(None, description="Filter by user ID"),
    limit: int = Query(50, le=200, description="Maximum records to return"),
    db: AsyncSession = Depends(get_db),
):
    """
    List audit logs with optional filters.
    
    - Filter by entity_type and entity_id to see history for a specific entity
    - Filter by user_id to see a user's activity
    """
    audit_service = get_audit_service(db)
    
    if entity_type and entity_id:
        logs = await audit_service.get_entity_history(entity_type, entity_id, limit)
    elif user_id:
        logs = await audit_service.get_user_activity(user_id, limit)
    else:
        # If no filters, return empty list (or implement general query)
        logs = []
    
    return create_response(logs)


@router.get("/config/{config_id}", response_model=ApiResponse[List[AuditLogResponse]])
async def get_config_history(
    config_id: str,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Get audit history for a specific configuration"""
    audit_service = get_audit_service(db)
    logs = await audit_service.get_entity_history("config", config_id, limit)
    return create_response(logs)


@router.get("/user/{user_id}", response_model=ApiResponse[List[AuditLogResponse]])
async def get_user_activity(
    user_id: str,
    limit: int = Query(100, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Get activity history for a specific user"""
    audit_service = get_audit_service(db)
    logs = await audit_service.get_user_activity(user_id, limit)
    return create_response(logs)


