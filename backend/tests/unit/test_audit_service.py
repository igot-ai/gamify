"""Unit tests for audit service"""

import pytest
from app.services.audit_service import get_audit_service
from app.models.audit_log import AuditAction


@pytest.mark.asyncio
async def test_log_config_created(db_session):
    """Test logging config creation"""
    audit_service = get_audit_service(db_session)
    
    log = await audit_service.log_config_created(
        config_id="config-123",
        user_id="user-456",
        game_id="game-789",
        environment_id="env-111"
    )
    
    assert log.entity_type == "config"
    assert log.entity_id == "config-123"
    assert log.action == AuditAction.CREATE
    assert log.user_id == "user-456"
    assert log.metadata["game_id"] == "game-789"
    assert log.metadata["environment_id"] == "env-111"


@pytest.mark.asyncio
async def test_log_config_updated(db_session):
    """Test logging config update"""
    audit_service = get_audit_service(db_session)
    
    changes = {
        "economy_config": {
            "old": {"currencies": []},
            "new": {"currencies": [{"id": "coins"}]}
        }
    }
    
    log = await audit_service.log_config_updated(
        config_id="config-123",
        user_id="user-456",
        changes=changes
    )
    
    assert log.action == AuditAction.UPDATE
    assert log.changes == changes


@pytest.mark.asyncio
async def test_log_config_deployed(db_session):
    """Test logging config deployment"""
    audit_service = get_audit_service(db_session)
    
    log = await audit_service.log_config_deployed(
        config_id="config-123",
        user_id="user-456",
        firebase_version="v123"
    )
    
    assert log.action == AuditAction.DEPLOY
    assert log.metadata["firebase_version"] == "v123"


@pytest.mark.asyncio
async def test_get_entity_history_empty(db_session):
    """Test getting history for entity with no logs"""
    audit_service = get_audit_service(db_session)
    
    history = await audit_service.get_entity_history("config", "nonexistent-id")
    
    assert len(history) == 0


@pytest.mark.asyncio
async def test_get_user_activity_empty(db_session):
    """Test getting activity for user with no logs"""
    audit_service = get_audit_service(db_session)
    
    activity = await audit_service.get_user_activity("nonexistent-user")
    
    assert len(activity) == 0


