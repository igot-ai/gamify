from pydantic import BaseModel, Field
from typing import List, Optional, Any
from enum import IntEnum


class ETutorialStep(IntEnum):
    """Tutorial step types"""
    LOAD_BOARD = 0
    SHOW_POPUP = 1
    SHOW_TOAST = 2
    HINT_TAP = 3
    HINT_POINT = 4


class Tile(BaseModel):
    """Tile configuration for LoadBoard step"""
    id: int = Field(..., ge=0, description="Tile ID")
    row: float = Field(..., description="Row position")
    col: float = Field(..., description="Column position")
    layer: int = Field(default=0, ge=0, description="Layer (z-index)")
    ind: int = Field(default=0, ge=0, description="Index")
    skin: int = Field(default=0, ge=0, description="Skin ID")
    
    class Config:
        json_schema_extra = {
            "example": {"id": 0, "row": 0, "col": -2, "layer": 0, "ind": 0, "skin": 0}
        }


class ToastModel(BaseModel):
    """Toast message configuration"""
    M: str = Field(..., description="Message key for localization")
    W: float = Field(..., gt=0, description="Width in world units")
    H: float = Field(..., gt=0, description="Height in world units")
    X: float = Field(..., ge=0, le=1, description="X position (0-1 viewport)")
    Y: float = Field(..., ge=0, le=1, description="Y position (0-1 viewport)")
    
    class Config:
        json_schema_extra = {
            "example": {"M": "TAP_3_TILES", "W": 8.05, "H": 2.23, "X": 0.5, "Y": 0.35}
        }


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
    Adaptive: int = Field(default=0, ge=0, description="Adaptive mode")
    Tiles: List[Tile] = Field(default_factory=list, description="Tile configurations")
    HolderTiles: List[Any] = Field(default_factory=list, description="Holder tile data")
    CanRevive: bool = Field(default=False, description="Whether revive is allowed")
    TotalTiles: int = Field(default=0, ge=0, description="Total tile count")


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
    
    class Config:
        json_schema_extra = {
            "example": {
                "Type": 0,
                "Data": {
                    "Level": 1,
                    "Adaptive": 0,
                    "Tiles": [],
                    "HolderTiles": [],
                    "CanRevive": False,
                    "TotalTiles": 0
                },
                "Focus": False
            }
        }


class TutorialLevel(BaseModel):
    """A tutorial level containing steps"""
    Level: int = Field(..., ge=1, description="Level number")
    Steps: List[TutorialStep] = Field(default_factory=list, description="Tutorial steps")
    
    class Config:
        json_schema_extra = {
            "example": {
                "Level": 1,
                "Steps": []
            }
        }


class TutorialData(BaseModel):
    """Tutorial data structure"""
    Id: str = Field(..., min_length=1, description="Tutorial ID")
    Levels: List[TutorialLevel] = Field(default_factory=list, description="Tutorial levels")
    
    class Config:
        json_schema_extra = {
            "example": {
                "Id": "1",
                "Levels": []
            }
        }


class TutorialConfig(BaseModel):
    """Full tutorial configuration"""
    data: TutorialData = Field(..., description="Tutorial data")
    
    class Config:
        json_schema_extra = {
            "example": {
                "data": {
                    "Id": "1",
                    "Levels": []
                }
            }
        }

