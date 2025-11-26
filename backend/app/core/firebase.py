"""Firebase Admin SDK initialization and configuration"""

import logging
from typing import Optional
import firebase_admin
from firebase_admin import credentials
from google.auth.transport.requests import AuthorizedSession
from app.core.config import settings

logger = logging.getLogger(__name__)

_firebase_app: Optional[firebase_admin.App] = None


def get_firebase_app() -> firebase_admin.App:
    """
    Get or initialize Firebase app instance (singleton pattern).
    
    Returns:
        firebase_admin.App: Initialized Firebase app
        
    Raises:
        ValueError: If Firebase credentials are not configured
        Exception: If Firebase initialization fails
    """
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    try:
        # Check if service account path is configured
        if not settings.FIREBASE_SERVICE_ACCOUNT_PATH:
            raise ValueError(
                "Firebase service account not configured. "
                "Set FIREBASE_SERVICE_ACCOUNT_PATH environment variable."
            )
        
        # Initialize Firebase Admin SDK
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
        _firebase_app = firebase_admin.initialize_app(cred)
        
        logger.info("Firebase Admin SDK initialized successfully")
        return _firebase_app
        
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {str(e)}")
        raise


def get_authorized_session(scopes: list[str]) -> AuthorizedSession:
    """Return an authorized Google API session for the configured Firebase app."""
    app = get_firebase_app()
    credential = app.credential.get_credential()
    if hasattr(credential, "with_scopes"):
        scoped_cred = credential.with_scopes(scopes)
    else:
        scoped_cred = credential
    return AuthorizedSession(scoped_cred)


def shutdown_firebase():
    """Shutdown Firebase app (useful for testing)"""
    global _firebase_app
    if _firebase_app is not None:
        firebase_admin.delete_app(_firebase_app)
        _firebase_app = None
        logger.info("Firebase Admin SDK shut down")
