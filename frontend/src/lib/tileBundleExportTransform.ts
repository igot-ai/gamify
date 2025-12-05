/**
 * Transform internal TileBundleConfig to Unity-compatible export format.
 */

import type { TileBundleConfig } from './validations/tileBundleConfig';

export interface ExportTileBundleConfig {
  Enabled: boolean;
  Discount: number;
  MinLevel: number;
  DaysPlayedTrigger: number;
  SessionsPlayedTrigger: number;
  DurationHours: number;
  MaxLifetimeShows: number;
  MaxSessionShows: number;
  CooldownPopupHours: number;
  CooldownOfferHours: number;
}

export function transformTileBundleConfigToExport(config: TileBundleConfig): ExportTileBundleConfig {
  if (!config) {
    return {
      Enabled: true,
      Discount: 20,
      MinLevel: 5,
      DaysPlayedTrigger: 3,
      SessionsPlayedTrigger: 5,
      DurationHours: 24,
      MaxLifetimeShows: 5,
      MaxSessionShows: 1,
      CooldownPopupHours: 24,
      CooldownOfferHours: 48,
    };
  }
  return {
    Enabled: config.enabled ?? true,
    Discount: config.discount ?? 20,
    MinLevel: config.minLevel ?? 5,
    DaysPlayedTrigger: config.daysPlayedTrigger ?? 3,
    SessionsPlayedTrigger: config.sessionsPlayedTrigger ?? 5,
    DurationHours: config.durationHours ?? 24,
    MaxLifetimeShows: config.maxLifetimeShows ?? 5,
    MaxSessionShows: config.maxSessionShows ?? 1,
    CooldownPopupHours: config.cooldownPopupHours ?? 24,
    CooldownOfferHours: config.cooldownOfferHours ?? 48,
  };
}

