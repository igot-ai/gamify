from typing import Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, field_validator


class GameBase(BaseModel):
    """Base game schema"""
    app_id: str  # User-defined App ID
    name: str
    description: Optional[str] = None
    avatar_url: Optional[str] = None


class GameCreate(BaseModel):
    """Schema for creating a new game"""
    app_id: str  # Required user-defined App ID
    name: str
    description: Optional[str] = None
    # firebase_service_account is handled via file upload in the endpoint


class GameUpdate(BaseModel):
    """Schema for updating a game"""
    name: Optional[str] = None
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    # firebase_service_account can be updated via file upload
    # app_id cannot be updated after creation


class GameResponse(GameBase):
    """Schema for game response"""
    id: str
    firebase_project_id: Optional[str] = None  # Extracted from service account JSON (safe to expose)
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class FirebaseServiceAccountValidation(BaseModel):
    """Schema for validating Firebase service account JSON structure"""
    type: str
    project_id: str
    private_key_id: str
    private_key: str
    client_email: str
    client_id: str
    auth_uri: str
    token_uri: str
    auth_provider_x509_cert_url: str
    client_x509_cert_url: str
    
    @field_validator('type')
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v != 'service_account':
            raise ValueError('type must be "service_account"')
        return v
    
    @field_validator('private_key')
    @classmethod
    def validate_private_key(cls, v: str) -> str:
        if not v.startswith('-----BEGIN PRIVATE KEY-----'):
            raise ValueError('Invalid private key format')
        return v
