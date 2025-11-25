"""Tests for API response format"""

import pytest
from datetime import datetime

from app.core.response import (
    ApiResponse,
    ApiMeta,
    create_response,
    create_error_response,
    ErrorDetail,
)


def test_api_response_structure():
    """Test that ApiResponse has correct structure"""
    data = {"id": "123", "name": "Test Game"}
    response = create_response(data)
    
    assert hasattr(response, "data")
    assert hasattr(response, "meta")
    assert response.data == data
    assert isinstance(response.meta, ApiMeta)
    assert hasattr(response.meta, "timestamp")


def test_api_response_with_list():
    """Test ApiResponse with list data"""
    data = [
        {"id": "1", "name": "Game 1"},
        {"id": "2", "name": "Game 2"},
    ]
    response = create_response(data)
    
    assert response.data == data
    assert len(response.data) == 2


def test_api_meta_timestamp():
    """Test that meta includes ISO timestamp"""
    response = create_response({"test": "data"})
    
    # Timestamp should be ISO format string
    assert isinstance(response.meta.timestamp, str)
    assert "T" in response.meta.timestamp  # ISO format includes T
    
    # Should be parseable as datetime
    datetime.fromisoformat(response.meta.timestamp.replace("Z", "+00:00"))


def test_error_response_structure():
    """Test error response structure"""
    error = create_error_response(
        code="VALIDATION_ERROR",
        message="Test error message"
    )
    
    assert hasattr(error, "error")
    assert error.error.code == "VALIDATION_ERROR"
    assert error.error.message == "Test error message"
    assert error.error.details is None


def test_error_response_with_details():
    """Test error response with detailed errors"""
    details = [
        ErrorDetail(field="email", message="Invalid email format"),
        ErrorDetail(field="age", message="Must be at least 18"),
    ]
    
    error = create_error_response(
        code="VALIDATION_ERROR",
        message="Validation failed",
        details=details
    )
    
    assert error.error.details is not None
    assert len(error.error.details) == 2
    assert error.error.details[0].field == "email"
    assert error.error.details[1].field == "age"


def test_response_serialization():
    """Test that response can be serialized to dict"""
    data = {"id": "123", "name": "Test"}
    response = create_response(data)
    
    response_dict = response.dict()
    
    assert "data" in response_dict
    assert "meta" in response_dict
    assert response_dict["data"] == data
    assert "timestamp" in response_dict["meta"]


def test_error_serialization():
    """Test that error response can be serialized to dict"""
    error = create_error_response(
        code="NOT_FOUND",
        message="Resource not found"
    )
    
    error_dict = error.dict()
    
    assert "error" in error_dict
    assert error_dict["error"]["code"] == "NOT_FOUND"
    assert error_dict["error"]["message"] == "Resource not found"


