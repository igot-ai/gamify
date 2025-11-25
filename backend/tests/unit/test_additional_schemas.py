import pytest
from pydantic import ValidationError
from app.schemas.config_sections.booster_config import BoosterItem, BoosterConfig
from app.schemas.config_sections.chapter_reward_config import ChapterRewardConfig
from app.schemas.config_sections.shop_config import ShopConfig
from app.schemas.config_sections.game_core_config import GameCoreConfig


class TestBoosterItemSchema:
    """Test BoosterItem schema"""
    
    def test_valid_booster_item(self):
        """Test creating a valid booster item"""
        item = BoosterItem(
            UnlockLevel=2,
            RefillAmount=1,
            Start=2
        )
        assert item.UnlockLevel == 2
        assert item.RefillAmount == 1
        assert item.Start == 2
    
    def test_invalid_unlock_level(self):
        """Test that unlock level < 1 is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            BoosterItem(UnlockLevel=0, RefillAmount=1, Start=2)
        assert "UnlockLevel" in str(exc_info.value)
    
    def test_negative_refill_amount(self):
        """Test that negative refill amount is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            BoosterItem(UnlockLevel=1, RefillAmount=-1, Start=2)
        assert "RefillAmount" in str(exc_info.value)


class TestBoosterConfigSchema:
    """Test BoosterConfig schema"""
    
    def test_valid_booster_config(self):
        """Test creating a valid booster configuration"""
        config = BoosterConfig(
            Undo=BoosterItem(UnlockLevel=2, RefillAmount=1, Start=2),
            Hint=BoosterItem(UnlockLevel=4, RefillAmount=1, Start=2),
            Shuffle=BoosterItem(UnlockLevel=3, RefillAmount=1, Start=2),
            AutoUseAfterAds=True
        )
        assert config.Undo.UnlockLevel == 2
        assert config.Hint.UnlockLevel == 4
        assert config.Shuffle.UnlockLevel == 3
        assert config.AutoUseAfterAds is True


class TestChapterRewardConfigSchema:
    """Test ChapterRewardConfig schema"""
    
    def test_valid_chapter_reward(self):
        """Test creating a valid chapter reward"""
        reward = ChapterRewardConfig(Undo=1, Hint=1, Shuffle=1)
        assert reward.Undo == 1
        assert reward.Hint == 1
        assert reward.Shuffle == 1
    
    def test_zero_rewards(self):
        """Test that zero rewards are allowed"""
        reward = ChapterRewardConfig(Undo=0, Hint=0, Shuffle=0)
        assert reward.Undo == 0
    
    def test_negative_rewards(self):
        """Test that negative rewards are rejected"""
        with pytest.raises(ValidationError) as exc_info:
            ChapterRewardConfig(Undo=-1, Hint=1, Shuffle=1)
        assert "Undo" in str(exc_info.value)


class TestShopConfigSchema:
    """Test ShopConfig schema"""
    
    def test_valid_shop_config(self):
        """Test creating a valid shop configuration"""
        config = ShopConfig(Enabled=True, RestoreMinLevel=1)
        assert config.Enabled is True
        assert config.RestoreMinLevel == 1
    
    def test_disabled_shop(self):
        """Test creating a disabled shop configuration"""
        config = ShopConfig(Enabled=False, RestoreMinLevel=5)
        assert config.Enabled is False
    
    def test_invalid_restore_level(self):
        """Test that restore level < 1 is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            ShopConfig(Enabled=True, RestoreMinLevel=0)
        assert "RestoreMinLevel" in str(exc_info.value)


class TestGameCoreConfigSchema:
    """Test GameCoreConfig schema"""
    
    def test_valid_game_core_config(self):
        """Test creating a valid game core configuration"""
        config = GameCoreConfig(
            Version="1.0.0",
            BuildNumber=100,
            MinSupportedVersion="1.0.0",
            ForceUpdate=False,
            MaintenanceMode=False
        )
        assert config.Version == "1.0.0"
        assert config.BuildNumber == 100
        assert config.ForceUpdate is False
    
    def test_invalid_version_format(self):
        """Test that invalid version format is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            GameCoreConfig(
                Version="1.0",  # Invalid format
                BuildNumber=100,
                MinSupportedVersion="1.0.0"
            )
        assert "Version" in str(exc_info.value)
        assert "X.Y.Z" in str(exc_info.value)
    
    def test_invalid_min_supported_version(self):
        """Test that invalid min supported version is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            GameCoreConfig(
                Version="1.0.0",
                BuildNumber=100,
                MinSupportedVersion="invalid"
            )
        assert "MinSupportedVersion" in str(exc_info.value)
    
    def test_maintenance_mode(self):
        """Test maintenance mode configuration"""
        config = GameCoreConfig(
            Version="1.0.0",
            BuildNumber=100,
            MinSupportedVersion="1.0.0",
            MaintenanceMode=True,
            MaintenanceMessage="Server maintenance in progress"
        )
        assert config.MaintenanceMode is True
        assert config.MaintenanceMessage == "Server maintenance in progress"
    
    def test_force_update(self):
        """Test force update configuration"""
        config = GameCoreConfig(
            Version="2.0.0",
            BuildNumber=200,
            MinSupportedVersion="1.5.0",
            ForceUpdate=True
        )
        assert config.ForceUpdate is True
