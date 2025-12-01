/**
 * Transform internal AnalyticsConfig to Unity-compatible export format.
 */

import type { AnalyticsConfig } from './validations/analyticsConfig';

export interface ExportAnalyticsConfig {
  DevKey: string;
  AppId: string;
}

export function transformAnalyticsConfigToExport(config: AnalyticsConfig): ExportAnalyticsConfig {
  return {
    DevKey: config.dev_key,
    AppId: config.app_id,
  };
}

