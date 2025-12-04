from typing import Optional
from pydantic import BaseModel, Field


class Vector2(BaseModel):
    """2D Vector for coordinate pairs"""
    x: float = Field(..., description="X coordinate")
    y: float = Field(..., description="Y coordinate")
    


class GameLogicConfig(BaseModel):
    """Game logic configuration subsection"""
    matchCount: int = Field(..., ge=1, description="Number of tiles needed to match")
    countUndoTileRevive: int = Field(..., ge=0, description="Count of undo tile revives")
    countShuffleTileRevive: int = Field(..., ge=0, description="Count of shuffle tile revives")
    countSlotHolder: int = Field(..., ge=1, description="Number of slot holders")
    warningThreshold: int = Field(..., ge=0, description="Warning threshold value")
    


class ComboConfig(BaseModel):
    """Combo configuration subsection"""
    matchEffect: int = Field(..., ge=0, description="Match effect value")
    maxNoMatch: int = Field(..., ge=0, description="Maximum no match count")
    


class GameLogic(BaseModel):
    """Game logic section containing game logic config and combo"""
    gameLogicConfig: GameLogicConfig = Field(..., description="Game logic configuration")
    combo: ComboConfig = Field(..., description="Combo configuration")
    


class GridView(BaseModel):
    """Grid view configuration"""
    tileSize: Vector2 = Field(..., description="Size of tiles")
    


class HolderView(BaseModel):
    """Holder view configuration"""
    slotSize: Vector2 = Field(..., description="Size of slots")
    slotSpace: float = Field(..., ge=0, description="Space between slots")
    ratioBetweenTwoTile: float = Field(..., ge=0, description="Ratio between two tiles")
    slotYPadding: float = Field(..., ge=0, description="Slot Y padding")
    tileInHolderYPadding: float = Field(..., ge=0, description="Tile in holder Y padding")
    


class ViewConfig(BaseModel):
    """View configuration section containing grid and holder views"""
    gridView: GridView = Field(..., description="Grid view configuration")
    holderView: HolderView = Field(..., description="Holder view configuration")
    


class GameConfig(BaseModel):
    """Game configuration - logic and view settings"""
    gameLogic: GameLogic = Field(..., description="Game logic settings")
    viewConfig: ViewConfig = Field(..., description="View configuration settings")
    



