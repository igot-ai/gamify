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


class TestNotificationConfigSchema:
    """Test NotificationConfig schema"""
    
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
