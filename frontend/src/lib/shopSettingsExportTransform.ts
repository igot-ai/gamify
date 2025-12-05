/**
 * Transform internal ShopSettingsConfig to Unity-compatible export format.
 */

import type { ShopSettingsConfig } from './validations/shopSettingsConfig';

export interface ExportShopSettingsConfig {
  Enabled: boolean;
  RestoreMinLevel: number;
}

export function transformShopSettingsConfigToExport(config: ShopSettingsConfig): ExportShopSettingsConfig {
  if (!config) {
    return {
      Enabled: true,
      RestoreMinLevel: 1,
    };
  }
  return {
    Enabled: config.enabled ?? true,
    RestoreMinLevel: config.restore_min_level ?? 1,
  };
}

