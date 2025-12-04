from pydantic import BaseModel, Field
from typing import List, Optional, Any, Tuple
from enum import IntEnum


class ETutorialStep(IntEnum):
    """Tutorial step types"""
    LOAD_BOARD = 0
    SHOW_POPUP = 1
    SHOW_TOAST = 2
    HINT_TAP = 3
    HINT_POINT = 4


# GridTile is a tuple of [column, -row, skinId]
GridTile = Tuple[float, float, int]


class ToastModel(BaseModel):
    """Toast message configuration"""
    M: str = Field(..., description="Message key for localization")
    W: float = Field(..., gt=0, description="Width in world units")
    H: float = Field(..., gt=0, description="Height in world units")
    X: float = Field(..., ge=0, le=1, description="X position (0-1 viewport)")
    Y: float = Field(..., ge=0, le=1, description="Y position (0-1 viewport)")
    


class HintTapInfo(BaseModel):
    """Additional info for HintTap step"""
    HandId: int = Field(default=1, ge=0, description="Hand visual style ID")
    HandAnim: int = Field(default=1, ge=0, description="Hand animation type")
    HandMoving: bool = Field(default=True, description="Whether hand moves up/down")
    HandAutoHide: bool = Field(default=False, description="Auto-hide hand after tap")
    TapEffect: bool = Field(default=False, description="Show tap effect")
    TileGlow: bool = Field(default=True, description="Add glow to target tile")
    TileHintMove: bool = Field(default=True, description="Show tile movement hint")


class HintPointInfo(BaseModel):
    """Additional info for HintPoint step"""
    HandId: int = Field(default=1, ge=0, description="Hand visual style ID")
    HandAutoHide: bool = Field(default=False, description="Auto-hide hand after point")
    TapEffect: bool = Field(default=True, description="Show tap effect")
    TileGlow: bool = Field(default=True, description="Add glow to target tile")


class LoadBoardData(BaseModel):
    """Data for LoadBoard step type"""
    Level: int = Field(..., ge=1, description="Level number")
    Moves: int = Field(..., ge=0, description="Number of moves allowed")
    GridTiles: List[List[float]] = Field(default_factory=list, description="Grid tiles as [column, -row, skinId]")
    HolderTiles: List[int] = Field(default_factory=list, description="Holder tiles skin IDs")
    


class ShowToastData(BaseModel):
    """Data for ShowToast step type"""
    Toast: ToastModel = Field(..., description="Toast configuration")
    FinishStep: int = Field(..., ge=0, description="Step at which toast hides")


class ShowPopupData(BaseModel):
    """Data for ShowPopup step type"""
    Popup: ToastModel = Field(..., description="Popup configuration")
    FinishStep: Optional[int] = Field(None, ge=0, description="Step at which popup hides")


class HintTapData(BaseModel):
    """Data for HintTap step type"""
    TileId: int = Field(..., ge=0, description="Target tile ID")
    AdditionInfo: HintTapInfo = Field(..., description="Hint tap configuration")


class HintPointData(BaseModel):
    """Data for HintPoint step type"""
    TileId: int = Field(..., ge=0, description="Target tile ID")
    AdditionInfo: HintPointInfo = Field(..., description="Hint point configuration")


class TutorialStep(BaseModel):
    """A single tutorial step"""
    Type: int = Field(..., ge=0, le=4, description="Step type (0-4)")
    Data: Any = Field(..., description="Step-specific data")
    Focus: bool = Field(default=False, description="Dim background for focus")
    


class TutorialLevel(BaseModel):
    """A tutorial level containing steps"""
    Level: int = Field(..., ge=1, description="Level number")
    Steps: List[TutorialStep] = Field(default_factory=list, description="Tutorial steps")
    


class TutorialData(BaseModel):
    """Tutorial data structure"""
    Id: str = Field(..., min_length=1, description="Tutorial ID")
    Levels: List[TutorialLevel] = Field(default_factory=list, description="Tutorial levels")
    


class TutorialConfig(BaseModel):
    """Full tutorial configuration"""
    option: int = Field(default=1, ge=1, description="Tutorial option (determines which Option_X.json to load)")
    data: TutorialData = Field(..., description="Tutorial data")
    

