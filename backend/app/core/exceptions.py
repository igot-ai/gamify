"""Custom exceptions for the application"""

from fastapi import status


class AppException(Exception):
    """Base exception for all application exceptions"""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ConfigNotFoundError(AppException):
    """Raised when a configuration is not found"""
    def __init__(self, config_id: str):
        super().__init__(
            message=f"Configuration with ID '{config_id}' not found",
            status_code=status.HTTP_404_NOT_FOUND
        )


class GameNotFoundError(AppException):
    """Raised when a game is not found"""
    def __init__(self, game_id: str):
        super().__init__(
            message=f"Game with ID '{game_id}' not found",
            status_code=status.HTTP_404_NOT_FOUND
        )


class EnvironmentNotFoundError(AppException):
    """Raised when an environment is not found"""
    def __init__(self, environment_id: str):
        super().__init__(
            message=f"Environment with ID '{environment_id}' not found",
            status_code=status.HTTP_404_NOT_FOUND
        )


class PermissionDeniedError(AppException):
    """Raised when user doesn't have permission for an action"""
    def __init__(self, action: str, resource: str = "resource"):
        super().__init__(
            message=f"Permission denied: cannot {action} {resource}",
            status_code=status.HTTP_403_FORBIDDEN
        )


class InvalidWorkflowTransitionError(AppException):
    """Raised when an invalid workflow state transition is attempted"""
    def __init__(self, current_status: str, target_status: str):
        super().__init__(
            message=f"Invalid workflow transition from '{current_status}' to '{target_status}'",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class FirebaseError(AppException):
    """Raised when Firebase operation fails"""
    def __init__(self, operation: str, details: str = ""):
        message = f"Firebase {operation} failed"
        if details:
            message += f": {details}"
        super().__init__(
            message=message,
            status_code=status.HTTP_502_BAD_GATEWAY
        )


class ValidationError(AppException):
    """Raised when data validation fails"""
    def __init__(self, field: str, message: str):
        super().__init__(
            message=f"Validation error for '{field}': {message}",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )


class DuplicateResourceError(AppException):
    """Raised when attempting to create a duplicate resource"""
    def __init__(self, resource_type: str, identifier: str):
        super().__init__(
            message=f"{resource_type} with identifier '{identifier}' already exists",
            status_code=status.HTTP_409_CONFLICT
        )


class ConfigLockError(AppException):
    """Raised when config is locked and cannot be modified"""
    def __init__(self, config_id: str, status: str):
        super().__init__(
            message=f"Configuration '{config_id}' is locked (status: {status}) and cannot be modified",
            status_code=status.HTTP_423_LOCKED
        )
