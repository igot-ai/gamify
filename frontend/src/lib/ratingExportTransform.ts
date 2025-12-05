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
  if (!config) {
    return {
      Enabled: true,
      MinStarRequired: 4,
      IntervalHours: 48,
      MinLevels: 9,
      MaxShowCount: 3,
    };
  }
  return {
    Enabled: config.enabled ?? true,
    MinStarRequired: config.min_star_required ?? 4,
    IntervalHours: config.interval_hours ?? 48,
    MinLevels: config.min_levels ?? 9,
    MaxShowCount: config.max_show_count ?? 3,
  };
}

