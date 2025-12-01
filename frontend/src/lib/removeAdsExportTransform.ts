/**
 * Transform internal RemoveAdsConfig to Unity-compatible export format.
 * 
 * This transforms camelCase internal structure to PascalCase Unity format.
 */

import type { RemoveAdsConfig } from './validations/removeAdsConfig';

// ============================================
// EXPORT FORMAT TYPE
// ============================================

export interface ExportRemoveAdsConfig {
  Enabled: boolean;
  MinLevel: number;
  AdWatchedTrigger: number;
  DaysPlayedTrigger: number;
  DurationHours: number;
  MaxLifetimeShows: number;
  MaxSessionShows: number;
  CooldownPopupHours: number;
  CooldownOfferHours: number;
}

// ============================================
// TRANSFORM FUNCTION
// ============================================

/**
 * Transform internal RemoveAdsConfig to Unity-compatible export format.
 */
export function transformRemoveAdsConfigToExport(config: RemoveAdsConfig): ExportRemoveAdsConfig {
  return {
    Enabled: config.enabled,
    MinLevel: config.minLevel,
    AdWatchedTrigger: config.adWatchedTrigger,
    DaysPlayedTrigger: config.daysPlayedTrigger,
    DurationHours: config.durationHours,
    MaxLifetimeShows: config.maxLifetimeShows,
    MaxSessionShows: config.maxSessionShows,
    CooldownPopupHours: config.cooldownPopupHours,
    CooldownOfferHours: config.cooldownOfferHours,
  };
}

