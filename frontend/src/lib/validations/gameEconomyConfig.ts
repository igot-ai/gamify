import { z } from 'zod';

export const gameEconomyConfigSchema = z.object({
  revive_coin_cost: z.number().int().min(0, 'Revive coin cost must be 0 or greater'),
  ad_level_complete_coin_reward: z.number().int().min(0, 'Ad level complete coin reward must be 0 or greater'),
  scenery_complete_coin_reward: z.number().int().min(0, 'Scenery complete coin reward must be 0 or greater'),
});

export type GameEconomyConfig = z.infer<typeof gameEconomyConfigSchema>;

export const defaultGameEconomyConfig: GameEconomyConfig = {
  revive_coin_cost: 0,
  ad_level_complete_coin_reward: 0,
  scenery_complete_coin_reward: 0,
};

