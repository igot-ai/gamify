import pytest
from pydantic import ValidationError
from app.schemas.config_sections.ad_config import (
    AdNetwork,
    FrequencyCap,
    AdPlacement,
    AdConfig
)


class TestAdNetworkSchema:
    """Test Ad Network schema validation"""
    
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
    """Test Frequency Cap schema validation"""
    
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
    """Test Ad Placement schema validation"""
    
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


class TestAdConfigSchema:
    """Test Ad Config schema validation"""
    
    def test_valid_ad_config(self):
        """Test creating a valid ad configuration"""
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
    
    def test_empty_networks(self):
        """Test that empty networks list is rejected"""
        with pytest.raises(ValidationError) as exc_info:
            AdConfig(
                networks=[],
                interstitial=AdPlacement(
                    enabled=True,
                    frequency_cap=FrequencyCap(count=3, period_minutes=60)
                ),
                rewarded=AdPlacement(
                    enabled=True,
                    frequency_cap=FrequencyCap(count=10, period_minutes=1440)
                ),
                banner=AdPlacement(
                    enabled=False,
                    frequency_cap=FrequencyCap(count=1, period_minutes=1)
                )
            )
        assert "networks" in str(exc_info.value)
