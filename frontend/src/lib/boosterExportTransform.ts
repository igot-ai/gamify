/**
 * Transform internal BoosterConfig to Unity-compatible export format.
 */

import type { BoosterConfig } from './validations/boosterConfig';

export interface ExportBoosterItem {
  UnlockLevel: number;
  RefillAmount: number;
  Start: number;
}

export interface ExportBoosterConfig {
  AutoUseAfterAds: boolean;
  TimeAutoSuggestion: number;
  AutoSuggestionEnabled: boolean;
  Boosters: {
    Undo: ExportBoosterItem;
    Hint: ExportBoosterItem;
    Shuffle: ExportBoosterItem;
  };
}

function transformBoosterItem(item: { unlock_level: number; refill_amount: number; start: number }): ExportBoosterItem {
  return {
    UnlockLevel: item.unlock_level,
    RefillAmount: item.refill_amount,
    Start: item.start,
  };
}

export function transformBoosterConfigToExport(config: BoosterConfig): ExportBoosterConfig {
  return {
    AutoUseAfterAds: config.auto_use_after_ads,
    TimeAutoSuggestion: config.time_auto_suggestion,
    AutoSuggestionEnabled: config.auto_suggestion_enabled,
    Boosters: {
      Undo: transformBoosterItem(config.undo),
      Hint: transformBoosterItem(config.hint),
      Shuffle: transformBoosterItem(config.shuffle),
    },
  };
}

