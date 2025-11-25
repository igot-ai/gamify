"""Integration tests for audit logging"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.audit_service import get_audit_service
from app.models.audit_log import AuditAction


@pytest.mark.asyncio
async def test_audit_log_creation(db_session: AsyncSession):
    """Test creating audit log entries"""
    
    audit_service = get_audit_service(db_session)
    
    # Create audit log
    log = await audit_service.log_action(
        entity_type="config",
        entity_id="test-config-123",
        action=AuditAction.CREATE,
        user_id="test-user-456",
        metadata={"test": "data"}
    )
    
    assert log.entity_type == "config"
    assert log.entity_id == "test-config-123"
    assert log.action == AuditAction.CREATE
    assert log.user_id == "test-user-456"
    assert log.metadata == {"test": "data"}


@pytest.mark.asyncio
async def test_get_entity_history(db_session: AsyncSession):
    """Test retrieving audit history for an entity"""
    
    audit_service = get_audit_service(db_session)
    entity_id = "test-config-789"
    
    # Create multiple audit logs
    actions = [AuditAction.CREATE, AuditAction.UPDATE, AuditAction.DEPLOY]
    for action in actions:
        await audit_service.log_action(
            entity_type="config",
            entity_id=entity_id,
            action=action,
            user_id="test-user"
        )
    
    await db_session.commit()
    
    # Get history
    history = await audit_service.get_entity_history("config", entity_id)
    
    assert len(history) == 3
    # Should be in reverse chronological order
    assert history[0].action == AuditAction.DEPLOY
    assert history[1].action == AuditAction.UPDATE
    assert history[2].action == AuditAction.CREATE


@pytest.mark.asyncio
async def test_get_user_activity(db_session: AsyncSession):
    """Test retrieving user activity history"""
    
    audit_service = get_audit_service(db_session)
    user_id = "test-user-activity"
    
    # Create logs for different entities
    for i in range(5):
        await audit_service.log_action(
            entity_type="config",
            entity_id=f"config-{i}",
            action=AuditAction.UPDATE,
            user_id=user_id
        )
    
    await db_session.commit()
    
    # Get user activity
    activity = await audit_service.get_user_activity(user_id)
    
    assert len(activity) == 5
    for log in activity:
        assert log.user_id == user_id


@pytest.mark.asyncio
async def test_config_status_change_logging(db_session: AsyncSession):
    """Test logging config status changes"""
    
    audit_service = get_audit_service(db_session)
    
    log = await audit_service.log_config_status_change(
        config_id="test-config",
        user_id="test-user",
        old_status="draft",
        new_status="in_review"
    )
    
    await db_session.commit()
    
    assert log.changes == {"status": {"old": "draft", "new": "in_review"}}
    assert log.action == AuditAction.UPDATE


@pytest.mark.asyncio
async def test_list_audit_logs_endpoint(
    async_client: AsyncClient,
    db_session: AsyncSession,
):
    """Test audit logs API endpoint"""
    
    # Create some audit logs
    audit_service = get_audit_service(db_session)
    entity_id = "test-endpoint-config"
    
    await audit_service.log_action(
        entity_type="config",
        entity_id=entity_id,
        action=AuditAction.CREATE,
        user_id="test-user"
    )
    await db_session.commit()
    
    # Query audit logs
    response = await async_client.get(
        f"/api/v1/audit-logs/?entity_type=config&entity_id={entity_id}"
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    logs = data["data"]
    assert len(logs) >= 1


@pytest.mark.asyncio
async def test_get_config_history_endpoint(
    async_client: AsyncClient,
    db_session: AsyncSession,
):
    """Test config history endpoint"""
    
    # Create audit logs for a config
    audit_service = get_audit_service(db_session)
    config_id = "test-history-config"
    
    for action in [AuditAction.CREATE, AuditAction.UPDATE]:
        await audit_service.log_action(
            entity_type="config",
            entity_id=config_id,
            action=action,
            user_id="test-user"
        )
    await db_session.commit()
    
    # Get history via API
    response = await async_client.get(f"/api/v1/audit-logs/config/{config_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    logs = data["data"]
    assert len(logs) >= 2


