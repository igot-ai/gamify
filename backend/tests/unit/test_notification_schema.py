import pytest
from pydantic import ValidationError
from app.schemas.config_sections.notification_config import (
    NotificationMessage,
    NotificationStrategy,
    NotificationChannel,
    NotificationConfig,
    NotificationMode,
    RepeatPolicy,
    SchedulingMode
)


class TestNotificationSchema:
    """Test Notification schema"""
    
    def test_valid_notification(self):
        """Test creating a valid notification"""
        notif = NotificationMessage(
            title="RETURN_1D_T",
            body="RETURN_1D_B",
            payload="custom_data",
            offset_seconds=3600
        )
        assert notif.title == "RETURN_1D_T"
        assert notif.offset_seconds == 3600
    
    def test_notification_empty_title(self):
        """Test that empty title is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            NotificationMessage(title="", body="Body")
        assert "title" in str(exc_info.value).lower()
    
    def test_notification_negative_offset(self):
        """Test that negative offset is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            NotificationMessage(
                title="Title",
                body="Body",
                offset_seconds=-100
            )
        assert "offset_seconds" in str(exc_info.value).lower()


class TestNotificationStrategySchema:
    """Test NotificationStrategy schema"""
    
    def test_valid_delay_strategy(self):
        """Test creating a valid delay-based strategy"""
        strategy = NotificationStrategy(
            id="D0_4H",
            name="4 Hours",
            mode=NotificationMode.DELAY,
            delay_seconds=14400,
            fixed_hour=12,
            fixed_minute=0,
            fixed_days_offset=1,
            repeat_policy=RepeatPolicy.NO_REPEAT,
            scheduling_mode=SchedulingMode.SEQUENTIAL,
            default_channel_id="default_channel",
            notifications=[
                NotificationMessage(title="RETURN_4H_1_T", body="RETURN_4H_1_B")
            ]
        )
        assert strategy.mode == NotificationMode.DELAY
        assert strategy.delay_seconds == 14400
        assert len(strategy.notifications) == 1
    
    def test_valid_fixed_time_strategy(self):
        """Test creating a valid fixed-time strategy"""
        strategy = NotificationStrategy(
            id="DAILY_REMINDER",
            name="Daily Reminder",
            mode=NotificationMode.FIXED_TIME,
            delay_seconds=0,
            fixed_hour=12,
            fixed_minute=30,
            fixed_days_offset=1,
            repeat_policy=RepeatPolicy.DAILY,
            scheduling_mode=SchedulingMode.RANDOM,
            default_channel_id="default_channel",
            notifications=[
                NotificationMessage(title="DAILY_T", body="DAILY_B")
            ]
        )
        assert strategy.mode == NotificationMode.FIXED_TIME
        assert strategy.fixed_hour == 12
        assert strategy.fixed_minute == 30
    
    def test_invalid_fixed_hour(self):
        """Test that hour outside 0-23 is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            NotificationStrategy(
                id="TEST",
                name="Test",
                mode=NotificationMode.FIXED_TIME,
                delay_seconds=0,
                fixed_hour=25,  # Invalid
                fixed_minute=0,
                fixed_days_offset=1,
                repeat_policy=RepeatPolicy.NO_REPEAT,
                scheduling_mode=SchedulingMode.SEQUENTIAL,
                default_channel_id="default_channel",
                notifications=[NotificationMessage(title="T", body="B")]
            )
        assert "fixed_hour" in str(exc_info.value).lower()
    
    def test_invalid_fixed_minute(self):
        """Test that minute outside 0-59 is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            NotificationStrategy(
                id="TEST",
                name="Test",
                mode=NotificationMode.FIXED_TIME,
                delay_seconds=0,
                fixed_hour=12,
                fixed_minute=60,  # Invalid
                fixed_days_offset=1,
                repeat_policy=RepeatPolicy.NO_REPEAT,
                scheduling_mode=SchedulingMode.SEQUENTIAL,
                default_channel_id="default_channel",
                notifications=[NotificationMessage(title="T", body="B")]
            )
        assert "fixed_minute" in str(exc_info.value).lower()
    
    def test_empty_notifications_list(self):
        """Test that empty notifications list is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            NotificationStrategy(
                id="TEST",
                name="Test",
                mode=NotificationMode.DELAY,
                delay_seconds=3600,
                fixed_hour=12,
                fixed_minute=0,
                fixed_days_offset=1,
                repeat_policy=RepeatPolicy.NO_REPEAT,
                scheduling_mode=SchedulingMode.SEQUENTIAL,
                default_channel_id="default_channel",
                notifications=[]  # Empty
            )
        assert "notifications" in str(exc_info.value).lower()


class TestNotificationChannelSchema:
    """Test NotificationChannel schema"""
    
    def test_valid_channel(self):
        """Test creating a valid notification channel"""
        channel = NotificationChannel(
            id="default_channel",
            name="Default",
            description="Default Channel",
            importance=3,
            enable_lights=True,
            enable_vibration=True
        )
        assert channel.id == "default_channel"
        assert channel.importance == 3
    
    def test_invalid_importance(self):
        """Test that importance outside 0-5 is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            NotificationChannel(
                id="test",
                name="Test",
                description="Test",
                importance=6  # Invalid
            )
        assert "importance" in str(exc_info.value).lower()
    
    def test_lock_screen_visibility_boundaries(self):
        """Test lock screen visibility boundaries (-1, 0, 1)"""
        # Valid: Secret (-1)
        channel_secret = NotificationChannel(
            id="secret", name="Secret", description="Secret", importance=3,
            lock_screen_visibility=-1
        )
        assert channel_secret.lock_screen_visibility == -1
        
        # Valid: Private (0)
        channel_private = NotificationChannel(
            id="private", name="Private", description="Private", importance=3,
            lock_screen_visibility=0
        )
        assert channel_private.lock_screen_visibility == 0
        
        # Valid: Public (1)
        channel_public = NotificationChannel(
            id="public", name="Public", description="Public", importance=3,
            lock_screen_visibility=1
        )
        assert channel_public.lock_screen_visibility == 1
        
        # Invalid: < -1
        with pytest.raises(ValidationError):
            NotificationChannel(
                id="invalid", name="Invalid", description="Invalid", importance=3,
                lock_screen_visibility=-2
            )
        
        # Invalid: > 1
        with pytest.raises(ValidationError):
            NotificationChannel(
                id="invalid", name="Invalid", description="Invalid", importance=3,
                lock_screen_visibility=2
            )
    
    def test_default_badge_boundary(self):
        """Test default badge cannot be negative"""
        with pytest.raises(ValidationError):
            NotificationChannel(
                id="test", name="Test", description="Test", importance=3,
                default_badge=-1
            )


class TestNotificationConfigSchema:
    """Test NotificationConfig schema"""
    
    def test_serialization_aliases(self):
        """Test that serialization uses camelCase aliases"""
        channel = NotificationChannel(
            id="test_channel",
            name="Test",
            description="Test Channel",
            importance=3,
            enable_lights=True,
            enable_vibration=False,
            can_bypass_dnd=True,
            can_show_badge=False,
            lock_screen_visibility=-1
        )
        # Serialize to dict using aliases
        data = channel.model_dump(by_alias=True)
        
        assert data["Id"] == "test_channel"
        assert data["Name"] == "Test"
        assert data["Description"] == "Test Channel"
        assert data["Importance"] == 3
        assert data["EnableLights"] is True
        assert data["EnableVibration"] is False
        assert data["CanBypassDnd"] is True
        assert data["CanShowBadge"] is False
        assert data["LockScreenVisibility"] == -1
    
    def test_strategy_serialization_aliases(self):
        """Test that strategy serialization uses camelCase aliases"""
        strategy = NotificationStrategy(
            id="TEST_STRATEGY",
            name="Test Strategy",
            mode=NotificationMode.FIXED_TIME,
            delay_seconds=0,
            fixed_hour=10,
            fixed_minute=30,
            fixed_days_offset=7,
            repeat_policy=RepeatPolicy.DAILY,
            repeat_seconds=86400,
            active=False,
            auto_scheduled=True,
            scheduling_mode=SchedulingMode.SEQUENTIAL,
            default_channel_id="default",
            notifications=[NotificationMessage(title="T", body="B", offset_seconds=60)]
        )
        data = strategy.model_dump(by_alias=True)
        
        assert data["Id"] == "TEST_STRATEGY"
        assert data["Name"] == "Test Strategy"
        assert data["Mode"] == 1  # FIXED_TIME
        assert data["DelaySeconds"] == 0
        assert data["FixedHour"] == 10
        assert data["FixedMinute"] == 30
        assert data["FixedDaysOffset"] == 7
        assert data["RepeatPolicy"] == 2  # DAILY
        assert data["RepeatSeconds"] == 86400
        assert data["Active"] is False
        assert data["AutoScheduled"] is True
        assert data["SchedulingMode"] == 1  # SEQUENTIAL
        assert data["DefaultChannelId"] == "default"
        assert data["Notifications"][0]["Title"] == "T"
        assert data["Notifications"][0]["OffsetSeconds"] == 60
    
    def test_full_config_serialization(self):
        """Test full config serialization with nested objects"""
        config = NotificationConfig(
            enable=True,
            strategies=[
                NotificationStrategy(
                    id="DAILY",
                    name="Daily",
                    mode=NotificationMode.DELAY,
                    delay_seconds=86400,
                    fixed_hour=12,
                    fixed_minute=0,
                    fixed_days_offset=1,
                    repeat_policy=RepeatPolicy.DAILY,
                    scheduling_mode=SchedulingMode.RANDOM,
                    default_channel_id="default_channel",
                    notifications=[NotificationMessage(title="DAILY_T", body="DAILY_B")]
                )
            ],
            channels=[
                NotificationChannel(
                    id="default_channel",
                    name="Default",
                    description="Default Channel",
                    importance=3
                )
            ]
        )
        data = config.model_dump(by_alias=True)
        
        assert data["Enable"] is True
        assert len(data["Strategies"]) == 1
        assert data["Strategies"][0]["Id"] == "DAILY"
        assert len(data["Channels"]) == 1
        assert data["Channels"][0]["Id"] == "default_channel"
    
    def test_valid_notification_config(self):
        """Test creating a valid notification configuration"""
        config = NotificationConfig(
            enable=True,
            strategies=[
                NotificationStrategy(
                    id="DAILY",
                    name="Daily",
                    mode=NotificationMode.DELAY,
                    delay_seconds=86400,
                    fixed_hour=12,
                    fixed_minute=0,
                    fixed_days_offset=1,
                    repeat_policy=RepeatPolicy.DAILY,
                    scheduling_mode=SchedulingMode.SEQUENTIAL,
                    default_channel_id="default_channel",
                    notifications=[NotificationMessage(title="T", body="B")]
                )
            ],
            channels=[
                NotificationChannel(
                    id="default_channel",
                    name="Default",
                    description="Default Channel",
                    importance=3
                )
            ]
        )
        assert config.enable is True
        assert len(config.strategies) == 1
        assert len(config.channels) == 1
    
    def test_empty_channels(self):
        """Test that empty channels list is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            NotificationConfig(
                enable=True,
                strategies=[],
                channels=[]  # Empty
            )
        assert "channels" in str(exc_info.value).lower()
    
    def test_duplicate_strategy_ids(self):
        """Test that duplicate strategy IDs are rejected"""
        with pytest.raises(ValidationError) as exc_info:
            NotificationConfig(
                enable=True,
                strategies=[
                    NotificationStrategy(
                        id="SAME_ID",
                        name="First",
                        mode=NotificationMode.DELAY,
                        delay_seconds=3600,
                        fixed_hour=12,
                        fixed_minute=0,
                        fixed_days_offset=1,
                        repeat_policy=RepeatPolicy.NO_REPEAT,
                        scheduling_mode=SchedulingMode.SEQUENTIAL,
                        default_channel_id="default",
                        notifications=[NotificationMessage(title="T", body="B")]
                    ),
                    NotificationStrategy(
                        id="SAME_ID",  # Duplicate
                        name="Second",
                        mode=NotificationMode.DELAY,
                        delay_seconds=7200,
                        fixed_hour=12,
                        fixed_minute=0,
                        fixed_days_offset=1,
                        repeat_policy=RepeatPolicy.NO_REPEAT,
                        scheduling_mode=SchedulingMode.SEQUENTIAL,
                        default_channel_id="default",
                        notifications=[NotificationMessage(title="T2", body="B2")]
                    )
                ],
                channels=[
                    NotificationChannel(id="default", name="Default", description="Default", importance=3)
                ]
            )
        assert "unique" in str(exc_info.value).lower()
    
    def test_duplicate_channel_ids(self):
        """Test that duplicate channel IDs are rejected"""
        with pytest.raises(ValidationError) as exc_info:
            NotificationConfig(
                enable=True,
                strategies=[],
                channels=[
                    NotificationChannel(id="same", name="First", description="First", importance=3),
                    NotificationChannel(id="same", name="Second", description="Second", importance=3)
                ]
            )
        assert "unique" in str(exc_info.value).lower()
