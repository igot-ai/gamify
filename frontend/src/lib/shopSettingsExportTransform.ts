/**
 * Transform internal ShopSettingsConfig to Unity-compatible export format.
 */

import type { ShopSettingsConfig } from './validations/shopSettingsConfig';

export interface ExportShopSettingsConfig {
  Enabled: boolean;
  RestoreMinLevel: number;
}

export function transformShopSettingsConfigToExport(config: ShopSettingsConfig): ExportShopSettingsConfig {
  return {
    Enabled: config.enabled,
    RestoreMinLevel: config.restore_min_level,
  };
}

