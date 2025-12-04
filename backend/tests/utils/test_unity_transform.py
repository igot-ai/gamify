"""Tests for Unity transform utilities"""

import pytest
from app.utils.unity_transform import transform_config_to_unity


def test_transform_economy_config():
    """Test transforming economy config to Unity format"""
    config = {
        "currencies": [
            {"id": "coin", "displayName": "Coins", "startingBalance": 100}
        ],
        "inventoryItems": [],
        "virtualPurchases": [],
        "realPurchases": [],
        "settings": {"enableRefundProcessing": False}
    }
    
    result = transform_config_to_unity("economy", config)
    
    assert "CurrencyDefinitions" in result
    assert len(result["CurrencyDefinitions"]) == 1
    assert result["CurrencyDefinitions"][0]["Id"] == "coin"
    assert result["CurrencyDefinitions"][0]["DisplayName"] == "Coins"


def test_transform_ad_config():
    """Test transforming ad config to Unity format"""
    config = {
        "adUnitIds": {
            "banner": "banner-id",
            "interstitial": "interstitial-id",
            "rewarded": "rewarded-id"
        },
        "advancedSettings": {
            "autoHideBanner": True,
            "bannerPosition": "Bottom"
        },
        "optionalSettings": {
            "enableConsentFlow": True
        },
        "placements": []
    }
    
    result = transform_config_to_unity("ads", config)
    
    assert "BannerAdUnitId" in result
    assert result["BannerAdUnitId"] == "banner-id"
    assert result["InterstitialAdUnitId"] == "interstitial-id"
    assert result["RewardedAdUnitId"] == "rewarded-id"
    assert result["AutoHideBanner"] is True


def test_transform_unknown_section_type():
    """Test transforming unknown section type returns original config"""
    config = {"test": "data"}
    
    result = transform_config_to_unity("unknown_type", config)
    
    assert result == config


def test_transform_haptic_config():
    """Test transforming haptic config to Unity format"""
    config = {
        "soft": {
            "android": {"duration": 100, "amplitude": 50},
            "ios": {"intensity": 0.5, "sharpness": 0.3, "duration": 100}
        },
        "light": {"android": {"duration": 50}, "ios": {"intensity": 0.3}},
        "medium": {"android": {"duration": 150}, "ios": {"intensity": 0.7}},
        "heavy": {"android": {"duration": 200}, "ios": {"intensity": 1.0}},
        "button": {"android": {"duration": 50}, "ios": {"intensity": 0.4}},
        "success": {"android": {"duration": 100}, "ios": {"intensity": 0.6}},
        "error": {"android": {"duration": 150}, "ios": {"intensity": 0.8}}
    }
    
    result = transform_config_to_unity("haptic", config)
    
    assert "Soft" in result
    assert "Android" in result["Soft"]
    assert "IOS" in result["Soft"]
    assert result["Soft"]["Android"]["Duration"] == 100

