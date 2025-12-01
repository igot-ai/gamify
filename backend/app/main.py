from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.core.config import settings
from app.api.v1.router import api_router
from app.core.exceptions import AppException
from app.core.error_handlers import (
    app_exception_handler,
    validation_exception_handler,
    integrity_error_handler,
    sqlalchemy_error_handler,
    general_exception_handler
)

app = FastAPI(
    title="Sunstudio Config Management API",
    version="1.0.0",
    description="Configuration management portal for game configs",
    redirect_slashes=False,  # Prevent 307 redirects for trailing slashes
)

# Create uploads directory if it doesn't exist
# Note: uploads are stored under app/uploads to match the save_avatar helper
UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Mount static files for uploads (at /api/v1/uploads to match API base URL)
app.mount(f"{settings.API_V1_PREFIX}/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Route handler for /avatars/{filename} - must be before API routes
AVATARS_DIR = UPLOADS_DIR / "avatars"
AVATARS_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/avatars/{filename:path}")
async def serve_avatar(filename: str):
    """Serve avatar files from the avatars directory"""
    # Security: prevent directory traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    file_path = AVATARS_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Avatar not found")
    return FileResponse(str(file_path))

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_error_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Sunstudio Configuration Management API",
        "docs": f"{settings.API_V1_PREFIX}/docs",
        "version": settings.VERSION,
    }
