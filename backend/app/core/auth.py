"""Authentication utilities - password hashing and JWT token management"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token. If expires_delta is None, token will not expire."""
    to_encode = data.copy()
    # Only add expiration if expires_delta is explicitly provided (not None)
    # If expires_delta is None, token will never expire
    if expires_delta is not None:
        expire = datetime.now(timezone.utc) + expires_delta
        to_encode.update({"exp": expire})
    # If expires_delta is None, don't add exp claim - token never expires
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT access token. Expiration is optional (tokens can be non-expiring)."""
    try:
        # Disable expiration verification to allow non-expiring tokens
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM],
            options={"verify_exp": False}
        )
        return payload
    except JWTError:
        return None
