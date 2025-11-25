"""Pydantic schemas for audit logs"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any

from app.models.audit_log import AuditAction


class AuditLogResponse(BaseModel):
    """Audit log response schema"""
    id: str
    entity_type: str
    entity_id: str
    action: AuditAction
    user_id: str
    changes: Optional[Dict[str, Any]] = None
    audit_metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True
        use_enum_values = True

