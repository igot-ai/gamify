"""
Transform internal config formats to Unity-compatible export format.

This transforms camelCase/snake_case internal structure to PascalCase Unity format
with numeric enum values where applicable.
"""

import logging
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


# ============================================
# ENUM MAPPINGS
# ============================================

# Ad config enums
AD_FORMAT_MAP = {
    "Banner": 0,
    "Interstitial": 1,
    "Rewarded": 2,
}

AD_ACTION_MAP = {
    "Load": 0,
    "Show": 1,
    "LoadAndShow": 2,
}

BANNER_POSITION_MAP = {
    "Bottom": 0,
    "Top": 1,
}

# Economy config enums
RESOURCE_TYPE_MAP = {
    "Currency": 0,
    "Item": 1,
}

PRODUCT_TYPE_MAP = {
    "Consumable": 0,
    "NonConsumable": 1,
}


# ============================================
# SECTION-SPECIFIC TRANSFORMS
# ============================================

def transform_hint_offer_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform HintOfferConfig to Unity format."""
    return {
        "Enabled": config.get("enabled", False),
        "Duration": config.get("duration", 0),
        "DelayBeforeCountdown": config.get("delay_before_countdown", 0),
        "MinLevel": config.get("min_level", 0),
        "IdleTimeTrigger": config.get("idle_time_trigger", 0),
        "MaxAppearancesPerLevel": config.get("max_appearances_per_level", 0),
    }


def transform_tutorial_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform TutorialConfig to Unity format."""
    def transform_step(step: Dict[str, Any]) -> Dict[str, Any]:
        data = step.get("Data", {})
        # LoadBoard step (Type 0) - data is already in correct format
        # GridTiles: [[column, -row, skinId], ...]
        # HolderTiles: [skinId, ...]
        if step.get("Type") == 0:
            data = {
                "Level": data.get("Level", 1),
                "Moves": data.get("Moves", 10),
                "GridTiles": data.get("GridTiles", []),
                "HolderTiles": data.get("HolderTiles", []),
            }
        return {
            "Type": step.get("Type", 0),
            "Data": data,
            "Focus": step.get("Focus", False),
        }
    
    def transform_level(level: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "Level": level.get("Level", 1),
            "Steps": [transform_step(s) for s in level.get("Steps", [])],
        }
    
    # Return the tutorial data structure
    data = config.get("data", {})
    return {
        "Id": data.get("Id", "1"),
        "Levels": [transform_level(l) for l in data.get("Levels", [])],
    }


def transform_spin_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform SpinConfig to Unity format."""
    def transform_reward_slot(slot: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "Probability": slot.get("probability", 0),
            "ItemId": slot.get("item_id", ""),
            "Amount": slot.get("amount", 0),
            "UpgradeMultiplier": slot.get("upgrade_multiplier", 1),
        }
    
    return {
        "Enabled": config.get("enabled", False),
        "MinLevel": config.get("min_level", 0),
        "FreeSpinCount": config.get("free_spin_count", 0),
        "AdSpinCount": config.get("ad_spin_count", 0),
        "CooldownHours": config.get("cooldown_hours", 0),
        "RewardSlots": [transform_reward_slot(slot) for slot in config.get("reward_slots", [])],
    }


def transform_rating_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform RatingConfig to Unity format."""
    return {
        "Enabled": config.get("enabled", False),
        "MinStarRequired": config.get("min_star_required", 0),
        "IntervalHours": config.get("interval_hours", 0),
        "MinLevels": config.get("min_levels", 0),
        "MaxShowCount": config.get("max_show_count", 0),
    }


def transform_link_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform LinkConfig to Unity format."""
    return {
        "PrivacyLink": config.get("privacy_link", ""),
        "TermsLink": config.get("terms_link", ""),
    }


def transform_haptic_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform HapticConfig to Unity format."""
    def transform_haptic_type(haptic: Dict[str, Any]) -> Dict[str, Any]:
        android = haptic.get("android", {})
        ios = haptic.get("ios", {})
        return {
            "Android": {
                "Duration": android.get("duration", 0),
                "Amplitude": android.get("amplitude", 0),
            },
            "IOS": {
                "Intensity": ios.get("intensity", 0),
                "Sharpness": ios.get("sharpness", 0),
                "Duration": ios.get("duration", 0),
            },
        }
    
    return {
        "Soft": transform_haptic_type(config.get("soft", {})),
        "Light": transform_haptic_type(config.get("light", {})),
        "Medium": transform_haptic_type(config.get("medium", {})),
        "Heavy": transform_haptic_type(config.get("heavy", {})),
        "Button": transform_haptic_type(config.get("button", {})),
        "Success": transform_haptic_type(config.get("success", {})),
        "Error": transform_haptic_type(config.get("error", {})),
    }


def transform_remove_ads_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform RemoveAdsConfig to Unity format."""
    return {
        "Enabled": config.get("enabled", False),
        "MinLevel": config.get("minLevel", 0),
        "AdWatchedTrigger": config.get("adWatchedTrigger", 0),
        "DaysPlayedTrigger": config.get("daysPlayedTrigger", 0),
        "DurationHours": config.get("durationHours", 0),
        "MaxLifetimeShows": config.get("maxLifetimeShows", 0),
        "MaxSessionShows": config.get("maxSessionShows", 0),
        "CooldownPopupHours": config.get("cooldownPopupHours", 0),
        "CooldownOfferHours": config.get("cooldownOfferHours", 0),
    }


def transform_tile_bundle_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform TileBundleConfig to Unity format."""
    return {
        "Enabled": config.get("enabled", False),
        "Discount": config.get("discount", 0),
        "MinLevel": config.get("minLevel", 0),
        "DaysPlayedTrigger": config.get("daysPlayedTrigger", 0),
        "SessionsPlayedTrigger": config.get("sessionsPlayedTrigger", 0),
        "DurationHours": config.get("durationHours", 0),
        "MaxLifetimeShows": config.get("maxLifetimeShows", 0),
        "MaxSessionShows": config.get("maxSessionShows", 0),
        "CooldownPopupHours": config.get("cooldownPopupHours", 0),
        "CooldownOfferHours": config.get("cooldownOfferHours", 0),
    }


def transform_booster_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform BoosterConfig to Unity format."""
    def transform_booster_item(item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "UnlockLevel": item.get("unlock_level", 0),
            "RefillAmount": item.get("refill_amount", 0),
            "Start": item.get("start", 0),
        }
    
    return {
        "AutoUseAfterAds": config.get("auto_use_after_ads", False),
        "TimeAutoSuggestion": config.get("time_auto_suggestion", 0),
        "AutoSuggestionEnabled": config.get("auto_suggestion_enabled", False),
        "Boosters": {
            "Undo": transform_booster_item(config.get("undo", {})),
            "Hint": transform_booster_item(config.get("hint", {})),
            "Shuffle": transform_booster_item(config.get("shuffle", {})),
        },
    }


def transform_chapter_reward_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform ChapterRewardConfig to Unity format."""
    return {
        "Undo": config.get("undo", 0),
        "Hint": config.get("hint", 0),
        "Shuffle": config.get("shuffle", 0),
    }


def transform_game_economy_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform GameEconomyConfig to Unity format."""
    return {
        "ReviveCoinCost": config.get("revive_coin_cost", 0),
        "AdLevelCompleteCoinReward": config.get("ad_level_complete_coin_reward", 0),
        "SceneryCompleteCoinReward": config.get("scenery_complete_coin_reward", 0),
    }


def transform_shop_settings_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform ShopSettingsConfig to Unity format."""
    return {
        "Enabled": config.get("enabled", False),
        "RestoreMinLevel": config.get("restore_min_level", 0),
    }


def transform_analytics_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform AnalyticsConfig to Unity format."""
    return {
        "DevKey": config.get("dev_key", ""),
        "AppId": config.get("app_id", ""),
    }


def transform_game_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform GameConfig to Unity format."""
    game_logic = config.get("gameLogic", {})
    game_logic_config = game_logic.get("gameLogicConfig", {})
    combo = game_logic.get("combo", {})
    view_config = config.get("viewConfig", {})
    grid_view = view_config.get("gridView", {})
    holder_view = view_config.get("holderView", {})
    tile_size = grid_view.get("tileSize", {})
    slot_size = holder_view.get("slotSize", {})
    
    return {
        "GameLogic": {
            "GameLogicConfig": {
                "MatchCount": game_logic_config.get("matchCount", 0),
                "CountUndoTileRevive": game_logic_config.get("countUndoTileRevive", 0),
                "CountShuffleTileRevive": game_logic_config.get("countShuffleTileRevive", 0),
                "CountSlotHolder": game_logic_config.get("countSlotHolder", 0),
                "WarningThreshold": game_logic_config.get("warningThreshold", 0),
            },
            "Combo": {
                "MatchEffect": combo.get("matchEffect", 0),
                "MaxNoMatch": combo.get("maxNoMatch", 0),
            },
        },
        "ViewConfig": {
            "GridView": {
                "TileSize": {
                    "X": tile_size.get("x", 0),
                    "Y": tile_size.get("y", 0),
                },
            },
            "HolderView": {
                "SlotSize": {
                    "X": slot_size.get("x", 0),
                    "Y": slot_size.get("y", 0),
                },
                "SlotSpace": holder_view.get("slotSpace", 0),
                "RatioBetweenTwoTile": holder_view.get("ratioBetweenTwoTile", 0),
                "SlotYPadding": holder_view.get("slotYPadding", 0),
                "TileInHolderYPadding": holder_view.get("tileInHolderYPadding", 0),
            },
        },
    }


def transform_ad_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform AdConfig to Unity format."""
    ad_unit_ids = config.get("adUnitIds", {})
    advanced = config.get("advancedSettings", {})
    optional = config.get("optionalSettings", {})
    
    def transform_placement(placement: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "PlacementId": placement.get("name", ""),
            "AdFormat": AD_FORMAT_MAP.get(placement.get("type", ""), 0),
            "Action": AD_ACTION_MAP.get(placement.get("action", ""), 0),
            "MinLevel": placement.get("minLevel", 1),
            "TimeBetween": placement.get("timeBetween", 0),
            "ShowLoading": placement.get("showLoading", False),
            "TimeOut": placement.get("timeOut", 30),
            "Retry": placement.get("retry", 0),
            "ShowAdNotice": placement.get("showAdNotice", False),
            "DelayTime": placement.get("delayTime", 0),
            "CustomAdUnitId": placement.get("customAdUnitId", ""),
        }
    
    return {
        "BannerAdUnitId": ad_unit_ids.get("banner", ""),
        "InterstitialAdUnitId": ad_unit_ids.get("interstitial", ""),
        "RewardedAdUnitId": ad_unit_ids.get("rewarded", ""),
        "AutoHideBanner": advanced.get("autoHideBanner", True),
        "BannerPosition": BANNER_POSITION_MAP.get(advanced.get("bannerPosition", "Bottom"), 0),
        "BannerRefreshRate": advanced.get("bannerRefreshRate", 0),
        "BannerMemoryThreshold": advanced.get("bannerMemoryThreshold", 1536),
        "DestroyBannerOnLowMemory": advanced.get("destroyBannerOnLowMemory", True),
        "PreloadInterstitial": advanced.get("preloadInterstitial", False),
        "PreloadRewarded": advanced.get("preloadRewarded", True),
        "EnableConsentFlow": optional.get("enableConsentFlow", True),
        "Placements": [transform_placement(p) for p in config.get("placements", [])],
    }


def transform_notification_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform NotificationConfig to Unity format."""
    def transform_message(msg: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "Title": msg.get("title", ""),
            "Body": msg.get("body", ""),
            "Payload": msg.get("payload", ""),
            "AndroidChannelId": msg.get("androidChannelId", ""),
            "IosCategory": msg.get("iosCategory", ""),
            "OffsetSeconds": msg.get("offsetSeconds", 0),
        }
    
    def transform_strategy(strategy: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "Id": strategy.get("id", ""),
            "Name": strategy.get("name", ""),
            "Mode": strategy.get("mode", 0),
            "DelaySeconds": strategy.get("delaySeconds", 0),
            "FixedHour": strategy.get("fixedHour", 0),
            "FixedMinute": strategy.get("fixedMinute", 0),
            "FixedDaysOffset": strategy.get("fixedDaysOffset", 0),
            "RepeatPolicy": strategy.get("repeatPolicy", 0),
            "RepeatSeconds": strategy.get("repeatSeconds", 0),
            "Active": strategy.get("active", True),
            "AutoScheduled": strategy.get("autoScheduled", False),
            "SchedulingMode": strategy.get("schedulingMode", 0),
            "DefaultChannelId": strategy.get("defaultChannelId", ""),
            "Notifications": [transform_message(m) for m in strategy.get("notifications", [])],
        }
    
    def transform_channel(channel: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "Id": channel.get("id", ""),
            "Name": channel.get("name", ""),
            "Description": channel.get("description", ""),
            "DefaultBadge": channel.get("defaultBadge", 0),
            "Importance": channel.get("importance", 3),
            "EnableLights": channel.get("enableLights", True),
            "EnableVibration": channel.get("enableVibration", True),
            "CanBypassDnd": channel.get("canBypassDnd", False),
            "CanShowBadge": channel.get("canShowBadge", True),
            "LockScreenVisibility": channel.get("lockScreenVisibility", 1),
        }
    
    return {
        "Enable": config.get("enable", True),
        "Strategies": [transform_strategy(s) for s in config.get("strategies", [])],
        "Channels": [transform_channel(c) for c in config.get("channels", [])],
    }


def transform_economy_config(config: Dict[str, Any]) -> Dict[str, Any]:
    """Transform EconomyConfig to Unity format."""
    def transform_currency(currency: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "Id": currency.get("id", ""),
            "DisplayName": currency.get("displayName", ""),
            "DefaultBalance": currency.get("startingBalance", 0),
            "MaxValue": currency.get("maxValue", 999999999),
            "AllowNegative": currency.get("allowNegative", False),
        }
    
    def transform_inventory_item(item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "Id": item.get("id", ""),
            "DisplayName": item.get("displayName", ""),
            "DefaultQuantity": item.get("startingQuantity", 0),
            "IsStackable": item.get("isStackable", True),
            "MaxStackSize": item.get("maxStackSize", 999),
        }
    
    def transform_resource_ref(ref: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "ResourceType": RESOURCE_TYPE_MAP.get(ref.get("type", ""), 0),
            "ResourceId": ref.get("resourceId", ""),
            "Amount": ref.get("amount", 0),
        }
    
    def transform_virtual_purchase(purchase: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "Id": purchase.get("id", ""),
            "Name": purchase.get("name", ""),
            "Costs": [transform_resource_ref(c) for c in purchase.get("costs", [])],
            "Rewards": [transform_resource_ref(r) for r in purchase.get("rewards", [])],
        }
    
    def transform_real_purchase(purchase: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "ProductId": purchase.get("productId", ""),
            "ProductType": PRODUCT_TYPE_MAP.get(purchase.get("productType", ""), 0),
            "Name": purchase.get("displayName", ""),
            "Rewards": [transform_resource_ref(r) for r in purchase.get("rewards", [])],
        }
    
    settings = config.get("settings", {})
    
    return {
        "CurrencyDefinitions": [transform_currency(c) for c in config.get("currencies", [])],
        "InventoryItemDefinitions": [transform_inventory_item(i) for i in config.get("inventoryItems", [])],
        "VirtualPurchaseDefinitions": [transform_virtual_purchase(p) for p in config.get("virtualPurchases", [])],
        "RealMoneyProductDefinitions": [transform_real_purchase(p) for p in config.get("realPurchases", [])],
        "EnableRefundProcessing": settings.get("enableRefundProcessing", False),
    }


# ============================================
# MAIN TRANSFORM FUNCTION
# ============================================

# Map section types to their transform functions
SECTION_TRANSFORMS = {
    "economy": transform_economy_config,
    "ads": transform_ad_config,
    "notification": transform_notification_config,
    "game": transform_game_config,
    "haptic": transform_haptic_config,
    "remove_ads": transform_remove_ads_config,
    "tile_bundle": transform_tile_bundle_config,
    "booster": transform_booster_config,
    "rating": transform_rating_config,
    "link": transform_link_config,
    "chapter_reward": transform_chapter_reward_config,
    "game_economy": transform_game_economy_config,
    "shop_settings": transform_shop_settings_config,
    "spin": transform_spin_config,
    "hint_offer": transform_hint_offer_config,
    "analytics": transform_analytics_config,
    "tutorial": transform_tutorial_config,
}


def transform_config_to_unity(section_type: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transform internal config format to Unity-compatible format.
    
    Args:
        section_type: The section type (e.g., "hint_offer", "spin", "economy")
        config: The internal config data to transform
        
    Returns:
        The transformed config in Unity format (PascalCase keys, numeric enums)
    """
    transform_fn = SECTION_TRANSFORMS.get(section_type)
    
    if transform_fn is None:
        logger.warning(f"No transform found for section type: {section_type}, returning original config")
        return config
    
    try:
        transformed = transform_fn(config)
        logger.debug(f"Successfully transformed {section_type} config to Unity format")
        return transformed
    except Exception as e:
        logger.error(f"Failed to transform {section_type} config: {str(e)}")
        raise ValueError(f"Failed to transform config for {section_type}: {str(e)}")

