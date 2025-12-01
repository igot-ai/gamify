from typing import Optional
from pydantic import BaseModel, Field


class Vector2(BaseModel):
    """2D Vector for coordinate pairs"""
    x: float = Field(..., description="X coordinate")
    y: float = Field(..., description="Y coordinate")
    
    class Config:
        json_schema_extra = {
            "example": {"x": 1.46, "y": 1.39}
        }


class GameLogicConfig(BaseModel):
    """Game logic configuration subsection"""
    matchCount: int = Field(..., ge=1, description="Number of tiles needed to match")
    countUndoTileRevive: int = Field(..., ge=0, description="Count of undo tile revives")
    countShuffleTileRevive: int = Field(..., ge=0, description="Count of shuffle tile revives")
    countSlotHolder: int = Field(..., ge=1, description="Number of slot holders")
    warningThreshold: int = Field(..., ge=0, description="Warning threshold value")
    
    class Config:
        json_schema_extra = {
            "example": {
                "matchCount": 3,
                "countUndoTileRevive": 5,
                "countShuffleTileRevive": 1,
                "countSlotHolder": 7,
                "warningThreshold": 5
            }
        }


class ComboConfig(BaseModel):
    """Combo configuration subsection"""
    matchEffect: int = Field(..., ge=0, description="Match effect value")
    maxNoMatch: int = Field(..., ge=0, description="Maximum no match count")
    
    class Config:
        json_schema_extra = {
            "example": {
                "matchEffect": 5,
                "maxNoMatch": 4
            }
        }


class GameLogic(BaseModel):
    """Game logic section containing game logic config and combo"""
    gameLogicConfig: GameLogicConfig = Field(..., description="Game logic configuration")
    combo: ComboConfig = Field(..., description="Combo configuration")
    
    class Config:
        json_schema_extra = {
            "example": {
                "gameLogicConfig": {
                    "matchCount": 3,
                    "countUndoTileRevive": 5,
                    "countShuffleTileRevive": 1,
                    "countSlotHolder": 7,
                    "warningThreshold": 5
                },
                "combo": {
                    "matchEffect": 5,
                    "maxNoMatch": 4
                }
            }
        }


class GridView(BaseModel):
    """Grid view configuration"""
    tileSize: Vector2 = Field(..., description="Size of tiles")
    
    class Config:
        json_schema_extra = {
            "example": {
                "tileSize": {"x": 1.46, "y": 1.39}
            }
        }


class HolderView(BaseModel):
    """Holder view configuration"""
    slotSize: Vector2 = Field(..., description="Size of slots")
    slotSpace: float = Field(..., ge=0, description="Space between slots")
    ratioBetweenTwoTile: float = Field(..., ge=0, description="Ratio between two tiles")
    slotYPadding: float = Field(..., ge=0, description="Slot Y padding")
    tileInHolderYPadding: float = Field(..., ge=0, description="Tile in holder Y padding")
    
    class Config:
        json_schema_extra = {
            "example": {
                "slotSize": {"x": 1.44, "y": 1.34},
                "slotSpace": 0,
                "ratioBetweenTwoTile": 0.9358974,
                "slotYPadding": 0.027,
                "tileInHolderYPadding": 0.102
            }
        }


class ViewConfig(BaseModel):
    """View configuration section containing grid and holder views"""
    gridView: GridView = Field(..., description="Grid view configuration")
    holderView: HolderView = Field(..., description="Holder view configuration")
    
    class Config:
        json_schema_extra = {
            "example": {
                "gridView": {
                    "tileSize": {"x": 1.46, "y": 1.39}
                },
                "holderView": {
                    "slotSize": {"x": 1.44, "y": 1.34},
                    "slotSpace": 0,
                    "ratioBetweenTwoTile": 0.9358974,
                    "slotYPadding": 0.027,
                    "tileInHolderYPadding": 0.102
                }
            }
        }


class GameConfig(BaseModel):
    """Game configuration - logic and view settings"""
    gameLogic: GameLogic = Field(..., description="Game logic settings")
    viewConfig: ViewConfig = Field(..., description="View configuration settings")
    
    class Config:
        json_schema_extra = {
            "example": {
                "gameLogic": {
                    "gameLogicConfig": {
                        "matchCount": 3,
                        "countUndoTileRevive": 5,
                        "countShuffleTileRevive": 1,
                        "countSlotHolder": 7,
                        "warningThreshold": 5
                    },
                    "combo": {
                        "matchEffect": 5,
                        "maxNoMatch": 4
                    }
                },
                "viewConfig": {
                    "gridView": {
                        "tileSize": {"x": 1.46, "y": 1.39}
                    },
                    "holderView": {
                        "slotSize": {"x": 1.44, "y": 1.34},
                        "slotSpace": 0,
                        "ratioBetweenTwoTile": 0.9358974,
                        "slotYPadding": 0.027,
                        "tileInHolderYPadding": 0.102
                    }
                }
            }
        }



