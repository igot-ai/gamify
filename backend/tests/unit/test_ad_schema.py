import pytest
from pydantic import ValidationError
from app.schemas.config_sections.ad_config import (
    # New models
    AdUnitIds,
    AdPlacementItem,
    PlacementType,
    PlacementAction,
    BannerPosition,
    AdvancedSettings,
    OptionalSettings,
    # Legacy models
    AdNetwork,
    FrequencyCap,
    AdPlacement,
    # Main config
    AdConfig
)


# ============================================
# Tests for New Schema Models
# ============================================
class TestAdUnitIdsSchema:
    """Test Ad Unit IDs schema validation"""
    
    def test_default_values(self):
        """Test that default values are empty strings"""
        unit_ids = AdUnitIds()
        assert unit_ids.banner == ""
        assert unit_ids.interstitial == ""
        assert unit_ids.rewarded == ""
    
    def test_with_values(self):
        """Test creating with actual values"""
        unit_ids = AdUnitIds(
            banner="ca-app-pub-xxx/banner",
            interstitial="ca-app-pub-xxx/interstitial",
            rewarded="ca-app-pub-xxx/rewarded"
        )
        assert unit_ids.banner == "ca-app-pub-xxx/banner"
        assert unit_ids.interstitial == "ca-app-pub-xxx/interstitial"
        assert unit_ids.rewarded == "ca-app-pub-xxx/rewarded"


class TestAdPlacementItemSchema:
    """Test Ad Placement Item schema validation"""
    
    def test_valid_placement(self):
        """Test creating a valid placement"""
        placement = AdPlacementItem(
            name="Button/Hint/Click",
            type=PlacementType.REWARDED,
            action=PlacementAction.LOAD_AND_SHOW,
            enabled=True
        )
        assert placement.name == "Button/Hint/Click"
        assert placement.type == PlacementType.REWARDED
        assert placement.action == PlacementAction.LOAD_AND_SHOW
        assert placement.enabled is True
    
    def test_string_enum_values(self):
        """Test that string values work for enums"""
        placement = AdPlacementItem(
            name="AppReady",
            type="Banner",
            action="LoadAndShow",
            enabled=True
        )
        assert placement.type == PlacementType.BANNER
        assert placement.action == PlacementAction.LOAD_AND_SHOW
    
    def test_empty_name_rejected(self):
        """Test that empty name is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            AdPlacementItem(
                name="",
                type=PlacementType.BANNER,
                action=PlacementAction.LOAD_AND_SHOW
            )
        assert "name" in str(exc_info.value)
    
    def test_default_values(self):
        """Test default values for type, action, and enabled"""
        placement = AdPlacementItem(name="TestPlacement")
        assert placement.type == PlacementType.BANNER
        assert placement.action == PlacementAction.LOAD_AND_SHOW
        assert placement.enabled is True


class TestAdvancedSettingsSchema:
    """Test Advanced Settings schema validation"""
    
    def test_default_values(self):
        """Test default values"""
        settings = AdvancedSettings()
        assert settings.preloadInterstitial is False
        assert settings.preloadRewarded is True
        assert settings.bannerPosition == BannerPosition.BOTTOM
        assert settings.bannerRefreshRate == 0
        assert settings.bannerMemoryThreshold == 1536
        assert settings.destroyBannerOnLowMemory is True
    
    def test_custom_values(self):
        """Test with custom values"""
        settings = AdvancedSettings(
            preloadInterstitial=True,
            preloadRewarded=False,
            bannerPosition=BannerPosition.TOP,
            bannerRefreshRate=30,
            bannerMemoryThreshold=2048,
            destroyBannerOnLowMemory=False
        )
        assert settings.preloadInterstitial is True
        assert settings.preloadRewarded is False
        assert settings.bannerPosition == BannerPosition.TOP
        assert settings.bannerRefreshRate == 30
        assert settings.bannerMemoryThreshold == 2048
        assert settings.destroyBannerOnLowMemory is False
    
    def test_negative_refresh_rate_rejected(self):
        """Test that negative refresh rate is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            AdvancedSettings(bannerRefreshRate=-1)
        assert "bannerRefreshRate" in str(exc_info.value)


class TestOptionalSettingsSchema:
    """Test Optional Settings schema validation"""
    
    def test_default_values(self):
        """Test default values"""
        settings = OptionalSettings()
        assert settings.enableConsentFlow is True
        assert settings.forceTestMode is False
        assert settings.removeAdsEnabled is False
    
    def test_custom_values(self):
        """Test with custom values"""
        settings = OptionalSettings(
            enableConsentFlow=False,
            forceTestMode=True,
            removeAdsEnabled=True
        )
        assert settings.enableConsentFlow is False
        assert settings.forceTestMode is True
        assert settings.removeAdsEnabled is True


# ============================================
# Tests for Legacy Schema Models
# ============================================
class TestAdNetworkSchema:
    """Test Ad Network schema validation (legacy)"""
    
    def test_valid_ad_network(self):
        """Test creating a valid ad network"""
        network = AdNetwork(
            id="admob",
            enabled=True,
            app_id="ca-app-pub-123456",
            priority=1
        )
        assert network.id == "admob"
        assert network.enabled is True
        assert network.app_id == "ca-app-pub-123456"
        assert network.priority == 1
    
    def test_invalid_priority(self):
        """Test that priority less than 1 is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            AdNetwork(
                id="admob",
                enabled=True,
                app_id="ca-app-pub-123456",
                priority=0
            )
        assert "priority" in str(exc_info.value)


class TestFrequencyCapSchema:
    """Test Frequency Cap schema validation (legacy)"""
    
    def test_valid_frequency_cap(self):
        """Test creating a valid frequency cap"""
        cap = FrequencyCap(count=3, period_minutes=60)
        assert cap.count == 3
        assert cap.period_minutes == 60
    
    def test_zero_count(self):
        """Test that zero count is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            FrequencyCap(count=0, period_minutes=60)
        assert "count" in str(exc_info.value)
    
    def test_zero_period(self):
        """Test that zero period is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            FrequencyCap(count=3, period_minutes=0)
        assert "period_minutes" in str(exc_info.value)


class TestAdPlacementSchema:
    """Test Ad Placement schema validation (legacy)"""
    
    def test_valid_ad_placement(self):
        """Test creating a valid ad placement"""
        placement = AdPlacement(
            enabled=True,
            frequency_cap=FrequencyCap(count=3, period_minutes=60),
            reward={"currency_id": "coins", "amount": 100}
        )
        assert placement.enabled is True
        assert placement.frequency_cap.count == 3
        assert placement.reward["currency_id"] == "coins"


# ============================================
# Tests for Main AdConfig Schema
# ============================================
class TestAdConfigSchema:
    """Test Ad Config schema validation"""
    
    def test_new_format_config(self):
        """Test creating a config with new format fields"""
        config = AdConfig(
            adUnitIds=AdUnitIds(
                banner="ca-app-pub-xxx/banner",
                interstitial="ca-app-pub-xxx/interstitial",
                rewarded="ca-app-pub-xxx/rewarded"
            ),
            placements=[
                AdPlacementItem(name="AppReady", type=PlacementType.BANNER, action=PlacementAction.LOAD_AND_SHOW),
                AdPlacementItem(name="Button/Hint/Click", type=PlacementType.REWARDED, action=PlacementAction.LOAD_AND_SHOW),
                AdPlacementItem(name="LevelProgress_0", type=PlacementType.INTERSTITIAL, action=PlacementAction.LOAD)
            ],
            advancedSettings=AdvancedSettings(
                preloadInterstitial=False,
                preloadRewarded=True,
                bannerPosition=BannerPosition.BOTTOM
            ),
            optionalSettings=OptionalSettings(
                enableConsentFlow=True,
                forceTestMode=False
            )
        )
        
        assert config.adUnitIds.banner == "ca-app-pub-xxx/banner"
        assert len(config.placements) == 3
        assert config.placements[0].name == "AppReady"
        assert config.advancedSettings.preloadRewarded is True
        assert config.optionalSettings.enableConsentFlow is True
    
    def test_default_config(self):
        """Test creating a config with all defaults"""
        config = AdConfig()
        
        assert config.adUnitIds.banner == ""
        assert config.placements == []
        assert config.advancedSettings.preloadRewarded is True
        assert config.optionalSettings.enableConsentFlow is True
        assert config.networks == []
        assert config.remove_ads_product_id == ""
    
    def test_legacy_format_config(self):
        """Test creating a config with legacy format fields"""
        config = AdConfig(
            networks=[
                AdNetwork(id="admob", enabled=True, app_id="ca-app-pub-123", priority=1),
                AdNetwork(id="unity", enabled=True, app_id="unity-app-id", priority=2)
            ],
            interstitial=AdPlacement(
                enabled=True,
                frequency_cap=FrequencyCap(count=3, period_minutes=60)
            ),
            rewarded=AdPlacement(
                enabled=True,
                frequency_cap=FrequencyCap(count=10, period_minutes=1440),
                reward={"currency_id": "coins", "amount": 200}
            ),
            banner=AdPlacement(
                enabled=False,
                frequency_cap=FrequencyCap(count=1, period_minutes=1)
            ),
            remove_ads_product_id="com.sunstudio.game.noads"
        )
        
        assert len(config.networks) == 2
        assert config.interstitial.enabled is True
        assert config.rewarded.reward["amount"] == 200
        assert config.remove_ads_product_id == "com.sunstudio.game.noads"
    
    def test_mixed_format_config(self):
        """Test creating a config with both new and legacy fields"""
        config = AdConfig(
            # New format
            adUnitIds=AdUnitIds(banner="ca-app-pub-xxx/banner"),
            placements=[
                AdPlacementItem(name="AppReady", type=PlacementType.BANNER)
            ],
            advancedSettings=AdvancedSettings(preloadRewarded=True),
            optionalSettings=OptionalSettings(forceTestMode=True),
            # Legacy format
            networks=[
                AdNetwork(id="admob", enabled=True, app_id="ca-app-pub-123", priority=1)
            ],
            remove_ads_product_id="com.sunstudio.game.noads"
        )
        
        # New format fields
        assert config.adUnitIds.banner == "ca-app-pub-xxx/banner"
        assert len(config.placements) == 1
        assert config.optionalSettings.forceTestMode is True
        
        # Legacy format fields
        assert len(config.networks) == 1
        assert config.remove_ads_product_id == "com.sunstudio.game.noads"
    
    def test_placement_types_and_actions(self):
        """Test all placement types and actions"""
        config = AdConfig(
            placements=[
                AdPlacementItem(name="Banner1", type=PlacementType.BANNER, action=PlacementAction.LOAD_AND_SHOW),
                AdPlacementItem(name="Inter1", type=PlacementType.INTERSTITIAL, action=PlacementAction.LOAD),
                AdPlacementItem(name="Inter2", type=PlacementType.INTERSTITIAL, action=PlacementAction.SHOW),
                AdPlacementItem(name="Reward1", type=PlacementType.REWARDED, action=PlacementAction.LOAD_AND_SHOW),
            ]
        )
        
        assert config.placements[0].type == PlacementType.BANNER
        assert config.placements[1].action == PlacementAction.LOAD
        assert config.placements[2].action == PlacementAction.SHOW
        assert config.placements[3].type == PlacementType.REWARDED
