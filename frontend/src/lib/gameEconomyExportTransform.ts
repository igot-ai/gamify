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
  if (!config) {
    return {
      ReviveCoinCost: 300,
      AdLevelCompleteCoinReward: 50,
      SceneryCompleteCoinReward: 50,
    };
  }
  return {
    ReviveCoinCost: config.revive_coin_cost ?? 300,
    AdLevelCompleteCoinReward: config.ad_level_complete_coin_reward ?? 50,
    SceneryCompleteCoinReward: config.scenery_complete_coin_reward ?? 50,
  };
}

