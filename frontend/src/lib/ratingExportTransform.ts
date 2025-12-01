/**
 * Transform internal RatingConfig to Unity-compatible export format.
 */

import type { RatingConfig } from './validations/ratingConfig';

export interface ExportRatingConfig {
  Enabled: boolean;
  MinStarRequired: number;
  IntervalHours: number;
  MinLevels: number;
  MaxShowCount: number;
}

export function transformRatingConfigToExport(config: RatingConfig): ExportRatingConfig {
  return {
    Enabled: config.enabled,
    MinStarRequired: config.min_star_required,
    IntervalHours: config.interval_hours,
    MinLevels: config.min_levels,
    MaxShowCount: config.max_show_count,
  };
}

