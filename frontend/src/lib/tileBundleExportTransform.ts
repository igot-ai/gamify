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
  return {
    Enabled: config.enabled,
    Discount: config.discount,
    MinLevel: config.minLevel,
    DaysPlayedTrigger: config.daysPlayedTrigger,
    SessionsPlayedTrigger: config.sessionsPlayedTrigger,
    DurationHours: config.durationHours,
    MaxLifetimeShows: config.maxLifetimeShows,
    MaxSessionShows: config.maxSessionShows,
    CooldownPopupHours: config.cooldownPopupHours,
    CooldownOfferHours: config.cooldownOfferHours,
  };
}

