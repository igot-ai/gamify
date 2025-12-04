from pydantic import BaseModel, Field


class ChapterRewardConfig(BaseModel):
    """Chapter completion reward configuration"""
    Undo: int = Field(ge=0, description="Number of Undo boosters rewarded")
    Hint: int = Field(ge=0, description="Number of Hint boosters rewarded")
    Shuffle: int = Field(ge=0, description="Number of Shuffle boosters rewarded")
    
