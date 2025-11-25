from fastapi import APIRouter

router = APIRouter()


@router.post("/login")
async def login():
    """Login endpoint - TODO: Implement Firebase Auth"""
    return {"message": "Login endpoint - to be implemented with Firebase Auth"}


@router.post("/logout")
async def logout():
    """Logout endpoint"""
    return {"message": "Logout successful"}


@router.get("/me")
async def get_current_user():
    """Get current user info - TODO: Implement with Firebase Auth"""
    return {"message": "User info - to be implemented"}
