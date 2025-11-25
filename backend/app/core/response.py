"""Standard API response wrappers"""

from typing import TypeVar, Generic, Optional, Any, List
from datetime import datetime
from pydantic import BaseModel, Field


T = TypeVar("T")


class ApiMeta(BaseModel):
    """Metadata for API responses"""
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ApiResponse(BaseModel, Generic[T]):
    """Standard success response wrapper"""
    data: T
    meta: ApiMeta = Field(default_factory=ApiMeta)


class ErrorDetail(BaseModel):
    """Detailed error information"""
    field: str
    message: str


class ErrorInfo(BaseModel):
    """Error response information"""
    code: str
    message: str
    details: Optional[List[ErrorDetail]] = None


class ApiErrorResponse(BaseModel):
    """Standard error response wrapper"""
    error: ErrorInfo


def create_response(data: T) -> ApiResponse[T]:
    """
    Create a standard API response.
    
    Args:
        data: The response data
        
    Returns:
        ApiResponse with data and metadata
    """
    return ApiResponse(data=data, meta=ApiMeta())


def create_error_response(
    code: str,
    message: str,
    details: Optional[List[ErrorDetail]] = None
) -> ApiErrorResponse:
    """
    Create a standard error response.
    
    Args:
        code: Error code (e.g., "VALIDATION_ERROR", "NOT_FOUND")
        message: Human-readable error message
        details: Optional list of detailed error information
        
    Returns:
        ApiErrorResponse with error information
    """
    return ApiErrorResponse(
        error=ErrorInfo(code=code, message=message, details=details)
    )


