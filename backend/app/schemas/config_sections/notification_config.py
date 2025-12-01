from typing import List
from enum import Enum
from pydantic import BaseModel, Field, field_validator, ConfigDict


class NotificationMode(int, Enum):
    """Notification scheduling mode"""
    DELAY = 0  # Delay from last session
    FIXED_TIME = 1  # Fixed time of day


class RepeatPolicy(int, Enum):
    """Notification repeat policy"""
    NO_REPEAT = 0
    DAILY = 2


class SchedulingMode(int, Enum):
    """Notification scheduling mode"""
    RANDOM = 0
    SEQUENTIAL = 1


class NotificationMessage(BaseModel):
    """Individual notification message"""
    model_config = ConfigDict(populate_by_name=True)
    
    title: str = Field(..., min_length=1, description="Notification title key")
    body: str = Field(..., min_length=1, description="Notification body key")
    payload: str = Field(default="", description="Custom payload data")
    androidChannelId: str = Field(default="", description="Android channel override")
    iosCategory: str = Field(default="", description="iOS category")
    offsetSeconds: int = Field(default=0, ge=0, description="Offset from strategy time")


class NotificationStrategy(BaseModel):
    """Notification strategy configuration"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str = Field(..., min_length=1, description="Unique strategy identifier")
    name: str = Field(..., min_length=1, description="Human-readable name")
    mode: NotificationMode = Field(..., description="Scheduling mode (delay or fixed time)")
    delaySeconds: int = Field(default=0, ge=0, description="Delay in seconds (for DELAY mode)")
    fixedHour: int = Field(default=0, ge=0, le=23, description="Hour for fixed time (0-23)")
    fixedMinute: int = Field(default=0, ge=0, le=59, description="Minute for fixed time (0-59)")
    fixedDaysOffset: int = Field(default=0, ge=0, description="Days offset for fixed time")
    repeatPolicy: RepeatPolicy = Field(..., description="Repeat policy")
    repeatSeconds: int = Field(default=0, ge=0, description="Repeat interval in seconds")
    active: bool = Field(default=True, description="Whether strategy is active")
    autoScheduled: bool = Field(default=True, description="Auto-schedule on trigger")
    schedulingMode: SchedulingMode = Field(..., description="Random or sequential selection")
    defaultChannelId: str = Field(..., min_length=1, description="Default notification channel")
    notifications: List[NotificationMessage] = Field(min_length=1, description="List of notification messages")


class NotificationChannel(BaseModel):
    """Android notification channel configuration"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str = Field(..., min_length=1, description="Channel identifier")
    name: str = Field(..., min_length=1, description="Channel name")
    description: str = Field(default="", description="Channel description")
    defaultBadge: int = Field(default=1, ge=0, description="Default badge count")
    importance: int = Field(default=3, ge=0, le=5, description="Channel importance (0-5)")
    enableLights: bool = Field(default=True, description="Enable notification lights")
    enableVibration: bool = Field(default=True, description="Enable vibration")
    canBypassDnd: bool = Field(default=False, description="Can bypass Do Not Disturb")
    canShowBadge: bool = Field(default=True, description="Can show badge")
    lockScreenVisibility: int = Field(default=0, ge=-1, le=1, description="Lock screen visibility")


class NotificationConfig(BaseModel):
    """Complete notification configuration"""
    model_config = ConfigDict(populate_by_name=True)
    
    enable: bool = Field(default=True, description="Enable notification system")
    strategies: List[NotificationStrategy] = Field(
        default_factory=list,
        description="Notification strategies"
    )
    channels: List[NotificationChannel] = Field(
        default_factory=list,
        description="Notification channels"
    )
    
    @field_validator('strategies')
    @classmethod
    def validate_unique_strategy_ids(cls, v: List[NotificationStrategy]) -> List[NotificationStrategy]:
        """Ensure strategy IDs are unique"""
        if not v:
            return v
        ids = [s.id for s in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Strategy IDs must be unique')
        return v
    
    @field_validator('channels')
    @classmethod
    def validate_unique_channel_ids(cls, v: List[NotificationChannel]) -> List[NotificationChannel]:
        """Ensure channel IDs are unique"""
        ids = [c.id for c in v]
        if len(ids) != len(set(ids)):
            raise ValueError('Channel IDs must be unique')
        return v
