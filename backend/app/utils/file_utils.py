"""File upload and management utilities"""

import uuid
import shutil
from pathlib import Path
from typing import Set

from fastapi import HTTPException, UploadFile, status


# Base upload directory (at backend/uploads, same level as app/)
# This keeps uploads separate from code for easier volume mounting and backup
UPLOAD_BASE_DIR = Path(__file__).parent.parent.parent / "uploads"

# Logo upload configuration
LOGO_UPLOAD_DIR = UPLOAD_BASE_DIR / "logos"
LOGO_ALLOWED_EXTENSIONS: Set[str] = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
LOGO_MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Avatar upload configuration
AVATAR_UPLOAD_DIR = UPLOAD_BASE_DIR / "avatars"
AVATAR_ALLOWED_EXTENSIONS: Set[str] = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
AVATAR_MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB


def _validate_file_extension(filename: str, allowed_extensions: Set[str]) -> str:
    """Validate file extension and return the extension"""
    file_ext = Path(filename).suffix.lower() if filename else ""
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )
    return file_ext


def _save_file(file: UploadFile, upload_dir: Path, file_ext: str) -> str:
    """Save file to upload directory and return the filename"""
    # Ensure upload directory exists
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = upload_dir / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()
    
    return unique_filename


async def save_logo(file: UploadFile) -> str:
    """
    Save uploaded logo file and return the relative path.
    
    Args:
        file: The uploaded file
        
    Returns:
        Relative path for storage in database (e.g., "/uploads/logos/uuid.png")
        
    Raises:
        HTTPException: If file type is not allowed
    """
    file_ext = _validate_file_extension(file.filename, LOGO_ALLOWED_EXTENSIONS)
    unique_filename = _save_file(file, LOGO_UPLOAD_DIR, file_ext)
    return f"/uploads/logos/{unique_filename}"


async def save_avatar(file: UploadFile) -> str:
    """
    Save uploaded avatar file and return the relative path.
    
    Args:
        file: The uploaded file
        
    Returns:
        Relative path for storage in database (e.g., "/uploads/avatars/uuid.png")
        
    Raises:
        HTTPException: If file type is not allowed
    """
    file_ext = _validate_file_extension(file.filename, AVATAR_ALLOWED_EXTENSIONS)
    unique_filename = _save_file(file, AVATAR_UPLOAD_DIR, file_ext)
    return f"/uploads/avatars/{unique_filename}"

