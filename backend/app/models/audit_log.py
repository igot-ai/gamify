from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Index, Enum
from sqlalchemy.orm import relationship
import enum
from app.models.base import BaseModel


class AuditAction(str, enum.Enum):
    """Enum for audit log actions"""
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    DEPLOY = "deploy"
    ROLLBACK = "rollback"
    APPROVE = "approve"
    REJECT = "reject"
    SUBMIT = "submit"


class AuditLog(BaseModel):
    """Audit log model for tracking all changes"""
    __tablename__ = "audit_logs"
    
    entity_type = Column(String, nullable=False, index=True)  # config, experiment, release
    entity_id = Column(String, nullable=False, index=True)  # No FK to allow audit of deleted entities
    action = Column(Enum(AuditAction), nullable=False, index=True)
    changes = Column(JSON, nullable=True)  # JSON diff of changes
    user_id = Column(String, nullable=False, index=True)
    audit_metadata = Column(JSON, nullable=True)  # Additional metadata
    timestamp = Column(DateTime, nullable=False)  # Explicit timestamp
    
    # Indexes for efficient querying
    __table_args__ = (
        Index('idx_audit_entity_timestamp', 'entity_id', 'created_at'),
        Index('idx_audit_user_timestamp', 'user_id', 'created_at'),
    )
