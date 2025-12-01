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
  return {
    Enabled: config.enabled,
    Duration: config.duration,
    DelayBeforeCountdown: config.delay_before_countdown,
    MinLevel: config.min_level,
    IdleTimeTrigger: config.idle_time_trigger,
    MaxAppearancesPerLevel: config.max_appearances_per_level,
  };
}

