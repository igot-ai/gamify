/**
 * Transform internal GameEconomyConfig to Unity-compatible export format.
 */

import type { GameEconomyConfig } from './validations/gameEconomyConfig';

export interface ExportGameEconomyConfig {
  ReviveCoinCost: number;
  AdLevelCompleteCoinReward: number;
  SceneryCompleteCoinReward: number;
}

export function transformGameEconomyConfigToExport(config: GameEconomyConfig): ExportGameEconomyConfig {
  return {
    ReviveCoinCost: config.revive_coin_cost,
    AdLevelCompleteCoinReward: config.ad_level_complete_coin_reward,
    SceneryCompleteCoinReward: config.scenery_complete_coin_reward,
  };
}

