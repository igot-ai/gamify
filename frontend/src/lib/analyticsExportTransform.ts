/**
 * Transform internal AnalyticsConfig to Unity-compatible export format.
 */

import type { AnalyticsConfig } from './validations/analyticsConfig';

export interface ExportAnalyticsConfig {
  DevKey: string;
  AppId: string;
}

export function transformAnalyticsConfigToExport(config: AnalyticsConfig): ExportAnalyticsConfig {
  if (!config) {
    return {
      DevKey: '',
      AppId: '',
    };
  }
  return {
    DevKey: config.dev_key ?? '',
    AppId: config.app_id ?? '',
  };
}

