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
  if (!config) {
    return {
      Enabled: true,
      MinLevel: 5,
      AdWatchedTrigger: 10,
      DaysPlayedTrigger: 3,
      DurationHours: 24,
      MaxLifetimeShows: 5,
      MaxSessionShows: 1,
      CooldownPopupHours: 24,
      CooldownOfferHours: 48,
    };
  }
  return {
    Enabled: config.enabled ?? true,
    MinLevel: config.minLevel ?? 5,
    AdWatchedTrigger: config.adWatchedTrigger ?? 10,
    DaysPlayedTrigger: config.daysPlayedTrigger ?? 3,
    DurationHours: config.durationHours ?? 24,
    MaxLifetimeShows: config.maxLifetimeShows ?? 5,
    MaxSessionShows: config.maxSessionShows ?? 1,
    CooldownPopupHours: config.cooldownPopupHours ?? 24,
    CooldownOfferHours: config.cooldownOfferHours ?? 48,
  };
}

