/**
 * Transform internal AdConfig to Unity-compatible export format.
 * 
 * This transforms camelCase internal structure to PascalCase Unity format
 * with numeric enum values instead of string enums.
 */

import type { AdConfig, PlacementType, PlacementAction, BannerPosition } from './validations/adConfig';

// ============================================
// EXPORT FORMAT TYPES
// ============================================

export interface ExportPlacement {
  PlacementId: string;
  AdFormat: number; // 0 = Banner, 1 = Interstitial, 2 = Rewarded
  Action: number; // 0 = Load, 1 = Show, 2 = LoadAndShow
  MinLevel: number;
  TimeBetween: number;
  ShowLoading: boolean;
  TimeOut: number;
  Retry: number;
  ShowAdNotice: boolean;
  DelayTime: number;
  CustomAdUnitId: string;
}

export interface ExportAdConfig {
  BannerAdUnitId: string;
  InterstitialAdUnitId: string;
  RewardedAdUnitId: string;
  AutoHideBanner: boolean;
  BannerPosition: number; // 0 = Bottom, 1 = Top
  BannerRefreshRate: number;
  BannerMemoryThreshold: number;
  DestroyBannerOnLowMemory: boolean;
  PreloadInterstitial: boolean;
  PreloadRewarded: boolean;
  EnableConsentFlow: boolean;
  Placements: ExportPlacement[];
}

// ============================================
// ENUM MAPPINGS
// ============================================

const AD_FORMAT_MAP: Record<PlacementType, number> = {
  Banner: 0,
  Interstitial: 1,
  Rewarded: 2,
};

const ACTION_MAP: Record<PlacementAction, number> = {
  Load: 0,
  Show: 1,
  LoadAndShow: 2,
};

const BANNER_POSITION_MAP: Record<BannerPosition, number> = {
  Bottom: 0,
  Top: 1,
};

// ============================================
// TRANSFORM FUNCTIONS
// ============================================

/**
 * Transform internal AdConfig to Unity-compatible export format.
 */
export function transformAdConfigToExport(config: AdConfig): ExportAdConfig {
  if (!config) {
    return {
      BannerAdUnitId: '',
      InterstitialAdUnitId: '',
      RewardedAdUnitId: '',
      AutoHideBanner: true,
      BannerPosition: 0,
      BannerRefreshRate: 0,
      BannerMemoryThreshold: 1536,
      DestroyBannerOnLowMemory: true,
      PreloadInterstitial: false,
      PreloadRewarded: true,
      EnableConsentFlow: true,
      Placements: [],
    };
  }
  return {
    BannerAdUnitId: config.adUnitIds?.banner ?? '',
    InterstitialAdUnitId: config.adUnitIds?.interstitial ?? '',
    RewardedAdUnitId: config.adUnitIds?.rewarded ?? '',
    AutoHideBanner: config.advancedSettings?.autoHideBanner ?? true,
    BannerPosition: BANNER_POSITION_MAP[config.advancedSettings?.bannerPosition ?? 'Bottom'],
    BannerRefreshRate: config.advancedSettings?.bannerRefreshRate ?? 0,
    BannerMemoryThreshold: config.advancedSettings?.bannerMemoryThreshold ?? 1536,
    DestroyBannerOnLowMemory: config.advancedSettings?.destroyBannerOnLowMemory ?? true,
    PreloadInterstitial: config.advancedSettings?.preloadInterstitial ?? false,
    PreloadRewarded: config.advancedSettings?.preloadRewarded ?? true,
    EnableConsentFlow: config.optionalSettings?.enableConsentFlow ?? true,
    Placements: transformPlacements(config.placements ?? []),
  };
}

function transformPlacements(placements: AdConfig['placements']): ExportPlacement[] {
  return (placements || []).filter(Boolean).map((placement) => ({
    PlacementId: placement.name ?? '',
    AdFormat: AD_FORMAT_MAP[placement.type] ?? 1,
    Action: ACTION_MAP[placement.action] ?? 2,
    MinLevel: placement.minLevel ?? 1,
    TimeBetween: placement.timeBetween ?? 0,
    ShowLoading: placement.showLoading ?? false,
    TimeOut: placement.timeOut ?? 30,
    Retry: placement.retry ?? 0,
    ShowAdNotice: placement.showAdNotice ?? false,
    DelayTime: placement.delayTime ?? 0,
    CustomAdUnitId: placement.customAdUnitId ?? '',
  }));
}

