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

const DEFAULT_BOOSTER_ITEM: ExportBoosterItem = {
  UnlockLevel: 1,
  RefillAmount: 1,
  Start: 2,
};

function transformBoosterItem(item?: { unlock_level: number; refill_amount: number; start: number }): ExportBoosterItem {
  if (!item) return DEFAULT_BOOSTER_ITEM;
  return {
    UnlockLevel: item.unlock_level ?? 1,
    RefillAmount: item.refill_amount ?? 1,
    Start: item.start ?? 2,
  };
}

export function transformBoosterConfigToExport(config: BoosterConfig): ExportBoosterConfig {
  if (!config) {
    return {
      AutoUseAfterAds: true,
      TimeAutoSuggestion: 5,
      AutoSuggestionEnabled: true,
      Boosters: {
        Undo: DEFAULT_BOOSTER_ITEM,
        Hint: DEFAULT_BOOSTER_ITEM,
        Shuffle: DEFAULT_BOOSTER_ITEM,
      },
    };
  }
  return {
    AutoUseAfterAds: config.auto_use_after_ads ?? true,
    TimeAutoSuggestion: config.time_auto_suggestion ?? 5,
    AutoSuggestionEnabled: config.auto_suggestion_enabled ?? true,
    Boosters: {
      Undo: transformBoosterItem(config.undo),
      Hint: transformBoosterItem(config.hint),
      Shuffle: transformBoosterItem(config.shuffle),
    },
  };
}

