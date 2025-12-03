"""Audit logging service for tracking configuration changes"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.audit_log import AuditLog, AuditAction

logger = logging.getLogger(__name__)


class AuditService:
    """Service for creating and querying audit logs"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def log_action(
        self,
        entity_type: str,
        entity_id: str,
        action: AuditAction,
        user_id: str,
        changes: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """
        Create an audit log entry.
        
        Args:
            entity_type: Type of entity (e.g., "config", "game", "experiment")
            entity_id: ID of the entity that was modified
            action: Action that was performed
            user_id: ID of user who performed the action
            changes: Optional dictionary of changes (old_value -> new_value)
            metadata: Optional additional metadata
            
        Returns:
            Created AuditLog instance
        """
        audit_log = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            user_id=user_id,
            changes=changes,
            audit_metadata=metadata,
            timestamp=datetime.utcnow()
        )
        
        self.db.add(audit_log)
        await self.db.flush()
        
        logger.info(
            f"Audit log created: {entity_type}:{entity_id} - {action.value} by user {user_id}"
        )
        
        return audit_log
    
    async def log_config_created(
        self,
        config_id: str,
        user_id: str,
        game_id: str,
        environment_id: str
    ) -> AuditLog:
        """Log configuration creation"""
        return await self.log_action(
            entity_type="config",
            entity_id=config_id,
            action=AuditAction.CREATE,
            user_id=user_id,
            metadata={"game_id": game_id, "environment_id": environment_id}
        )
    
    async def log_config_updated(
        self,
        config_id: str,
        user_id: str,
        changes: Dict[str, Any]
    ) -> AuditLog:
        """Log configuration update"""
        return await self.log_action(
            entity_type="config",
            entity_id=config_id,
            action=AuditAction.UPDATE,
            user_id=user_id,
            changes=changes
        )
    
    async def log_config_status_change(
        self,
        config_id: str,
        user_id: str,
        old_status: str,
        new_status: str
    ) -> AuditLog:
        """Log configuration status change"""
        return await self.log_action(
            entity_type="config",
            entity_id=config_id,
            action=AuditAction.UPDATE,
            user_id=user_id,
            changes={"status": {"old": old_status, "new": new_status}}
        )
    
    async def log_config_deleted(
        self,
        config_id: str,
        user_id: str
    ) -> AuditLog:
        """Log configuration deletion"""
        return await self.log_action(
            entity_type="config",
            entity_id=config_id,
            action=AuditAction.DELETE,
            user_id=user_id
        )
    
    async def get_entity_history(
        self,
        entity_type: str,
        entity_id: str,
        limit: int = 50
    ) -> list[AuditLog]:
        """
        Get audit history for a specific entity.
        
        Args:
            entity_type: Type of entity
            entity_id: Entity ID
            limit: Maximum number of records to return
            
        Returns:
            List of audit logs ordered by timestamp descending
        """
        result = await self.db.execute(
            select(AuditLog)
            .where(AuditLog.entity_type == entity_type)
            .where(AuditLog.entity_id == entity_id)
            .order_by(AuditLog.timestamp.desc())
            .limit(limit)
        )
        
        return result.scalars().all()
    
    async def get_user_activity(
        self,
        user_id: str,
        limit: int = 100
    ) -> list[AuditLog]:
        """
        Get audit history for a specific user.
        
        Args:
            user_id: User ID
            limit: Maximum number of records to return
            
        Returns:
            List of audit logs ordered by timestamp descending
        """
        result = await self.db.execute(
            select(AuditLog)
            .where(AuditLog.user_id == user_id)
            .order_by(AuditLog.timestamp.desc())
            .limit(limit)
        )
        
        return result.scalars().all()


def get_audit_service(db: AsyncSession) -> AuditService:
    """Get audit service instance"""
    return AuditService(db)

