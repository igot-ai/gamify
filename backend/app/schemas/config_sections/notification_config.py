from typing import List, Optional
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
    
    title: str = Field(..., min_length=1, description="Notification title key", serialization_alias="Title")
    body: str = Field(..., min_length=1, description="Notification body key", serialization_alias="Body")
    payload: str = Field(default="", description="Custom payload data", serialization_alias="Payload")
    android_channel_id: str = Field(default="", description="Android channel override", serialization_alias="AndroidChannelId")
    ios_category: str = Field(default="", description="iOS category", serialization_alias="IosCategory")
    offset_seconds: int = Field(default=0, ge=0, description="Offset from strategy time", serialization_alias="OffsetSeconds")


class NotificationStrategy(BaseModel):
    """Notification strategy configuration"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str = Field(..., min_length=1, description="Unique strategy identifier", serialization_alias="Id")
    name: str = Field(..., min_length=1, description="Human-readable name", serialization_alias="Name")
    mode: NotificationMode = Field(..., description="Scheduling mode (delay or fixed time)", serialization_alias="Mode")
    delay_seconds: int = Field(ge=0, description="Delay in seconds (for DELAY mode)", serialization_alias="DelaySeconds")
    fixed_hour: int = Field(ge=0, le=23, description="Hour for fixed time (0-23)", serialization_alias="FixedHour")
    fixed_minute: int = Field(ge=0, le=59, description="Minute for fixed time (0-59)", serialization_alias="FixedMinute")
    fixed_days_offset: int = Field(ge=0, description="Days offset for fixed time", serialization_alias="FixedDaysOffset")
    repeat_policy: RepeatPolicy = Field(..., description="Repeat policy", serialization_alias="RepeatPolicy")
    repeat_seconds: int = Field(default=0, ge=0, description="Repeat interval in seconds", serialization_alias="RepeatSeconds")
    active: bool = Field(default=True, description="Whether strategy is active", serialization_alias="Active")
    auto_scheduled: bool = Field(default=True, description="Auto-schedule on trigger", serialization_alias="AutoScheduled")
    scheduling_mode: SchedulingMode = Field(..., description="Random or sequential selection", serialization_alias="SchedulingMode")
    default_channel_id: str = Field(..., min_length=1, description="Default notification channel", serialization_alias="DefaultChannelId")
    notifications: List[NotificationMessage] = Field(min_length=1, description="List of notification messages", serialization_alias="Notifications")


class NotificationChannel(BaseModel):
    """Android notification channel configuration"""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str = Field(..., min_length=1, description="Channel identifier", serialization_alias="Id")
    name: str = Field(..., min_length=1, description="Channel name", serialization_alias="Name")
    description: str = Field(..., description="Channel description", serialization_alias="Description")
    default_badge: int = Field(default=1, ge=0, description="Default badge count", serialization_alias="DefaultBadge")
    importance: int = Field(ge=0, le=5, description="Channel importance (0-5)", serialization_alias="Importance")
    enable_lights: bool = Field(default=True, description="Enable notification lights", serialization_alias="EnableLights")
    enable_vibration: bool = Field(default=True, description="Enable vibration", serialization_alias="EnableVibration")
    can_bypass_dnd: bool = Field(default=False, description="Can bypass Do Not Disturb", serialization_alias="CanBypassDnd")
    can_show_badge: bool = Field(default=True, description="Can show badge", serialization_alias="CanShowBadge")
    lock_screen_visibility: int = Field(default=0, ge=-1, le=1, description="Lock screen visibility", serialization_alias="LockScreenVisibility")


class NotificationConfig(BaseModel):
    """Complete notification configuration"""
    model_config = ConfigDict(populate_by_name=True)
    
    enable: bool = Field(default=True, description="Enable notification system", serialization_alias="Enable")
    strategies: List[NotificationStrategy] = Field(
        default_factory=list,
        description="Notification strategies",
        serialization_alias="Strategies"
    )
    channels: List[NotificationChannel] = Field(
        min_length=1,
        description="At least one notification channel required",
        serialization_alias="Channels"
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

