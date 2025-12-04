from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from enum import Enum


# ============================================
# Enums
# ============================================
class PlacementType(str, Enum):
    """Ad placement type"""
    BANNER = "Banner"
    INTERSTITIAL = "Interstitial"
    REWARDED = "Rewarded"


class PlacementAction(str, Enum):
    """Ad placement action"""
    LOAD = "Load"
    SHOW = "Show"
    LOAD_AND_SHOW = "LoadAndShow"


class BannerPosition(str, Enum):
    """Banner position on screen"""
    TOP = "Top"
    BOTTOM = "Bottom"


# ============================================
# Schema Models
# ============================================
class AdUnitIds(BaseModel):
    """Ad unit IDs for different ad types"""
    banner: str = Field(default="", description="Banner ad unit ID")
    interstitial: str = Field(default="", description="Interstitial ad unit ID")
    rewarded: str = Field(default="", description="Rewarded ad unit ID")


class AdPlacementItem(BaseModel):
    """Individual ad placement configuration"""
    name: str = Field(..., min_length=1, description="Placement name/identifier")
    type: PlacementType = Field(default=PlacementType.BANNER, description="Ad type")
    action: PlacementAction = Field(default=PlacementAction.LOAD_AND_SHOW, description="Ad action")
    enabled: bool = Field(default=True, description="Whether this placement is enabled")
    minLevel: int = Field(default=1, ge=0, description="Minimum player level to show this ad")
    timeBetween: int = Field(default=0, ge=0, description="Time between ads in seconds")
    showLoading: bool = Field(default=False, description="Show loading indicator while ad loads")
    timeOut: int = Field(default=30, ge=0, description="Timeout in seconds for ad loading")
    retry: int = Field(default=0, ge=0, description="Number of retry attempts")
    showAdNotice: bool = Field(default=False, description="Show ad notice before displaying")
    delayTime: int = Field(default=0, ge=0, description="Delay time in seconds before showing ad")
    customAdUnitId: str = Field(default="", description="Custom ad unit ID for this placement")


class AdvancedSettings(BaseModel):
    """Advanced ad configuration settings"""
    autoHideBanner: bool = Field(default=True, description="Automatically hide banner when not needed")
    preloadInterstitial: bool = Field(default=False, description="Preload interstitial ads on app start")
    preloadRewarded: bool = Field(default=True, description="Preload rewarded ads on app start")
    bannerPosition: BannerPosition = Field(default=BannerPosition.BOTTOM, description="Banner position on screen")
    bannerRefreshRate: int = Field(default=0, ge=0, description="Banner refresh rate in seconds (0 = no refresh)")
    bannerMemoryThreshold: int = Field(default=1536, ge=0, description="Memory threshold in MB for banner destruction")
    destroyBannerOnLowMemory: bool = Field(default=True, description="Destroy banners when memory is low")


class OptionalSettings(BaseModel):
    """Optional ad feature settings"""
    enableConsentFlow: bool = Field(default=True, description="Show GDPR/CCPA consent dialog")
    forceTestMode: bool = Field(default=False, description="Always use test ads")
    removeAdsEnabled: bool = Field(default=False, description="Allow users to purchase ad removal")


# ============================================
# Main Ad Config Schema
# ============================================
class AdConfig(BaseModel):
    """Advertisement configuration schema"""
    
    adUnitIds: AdUnitIds = Field(
        default_factory=lambda: AdUnitIds(),
        description="Ad unit IDs for different ad types"
    )
    placements: List[AdPlacementItem] = Field(
        default_factory=list,
        description="List of ad placements"
    )
    advancedSettings: AdvancedSettings = Field(
        default_factory=lambda: AdvancedSettings(),
        description="Advanced ad settings"
    )
    optionalSettings: OptionalSettings = Field(
        default_factory=lambda: OptionalSettings(),
        description="Optional ad settings"
    )
