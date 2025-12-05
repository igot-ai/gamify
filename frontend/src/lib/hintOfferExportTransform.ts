/**
 * Transform internal HintOfferConfig to Unity-compatible export format.
 */

import type { HintOfferConfig } from './validations/hintOfferConfig';

export interface ExportHintOfferConfig {
  Enabled: boolean;
  Duration: number;
  DelayBeforeCountdown: number;
  MinLevel: number;
  IdleTimeTrigger: number;
  MaxAppearancesPerLevel: number;
}

export function transformHintOfferConfigToExport(config: HintOfferConfig): ExportHintOfferConfig {
  if (!config) {
    return {
      Enabled: true,
      Duration: 5,
      DelayBeforeCountdown: 0,
      MinLevel: 1,
      IdleTimeTrigger: 10,
      MaxAppearancesPerLevel: 3,
    };
  }
  return {
    Enabled: config.enabled ?? true,
    Duration: config.duration ?? 5,
    DelayBeforeCountdown: config.delay_before_countdown ?? 0,
    MinLevel: config.min_level ?? 1,
    IdleTimeTrigger: config.idle_time_trigger ?? 10,
    MaxAppearancesPerLevel: config.max_appearances_per_level ?? 3,
  };
}

