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


class ValidationError(AppException):
    """Raised when data validation fails"""
    def __init__(self, field: str, message: str):
        super().__init__(
            message=f"Validation error for '{field}': {message}",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )
