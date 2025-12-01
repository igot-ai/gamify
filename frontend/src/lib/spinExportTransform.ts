/**
 * Transform internal SpinConfig to Unity-compatible export format.
 */

import type { SpinConfig, RewardSlot } from './validations/spinConfig';

export interface ExportRewardSlot {
  Probability: number;
  ItemId: string;
  Amount: number;
  UpgradeMultiplier: number;
}

export interface ExportSpinConfig {
  Enabled: boolean;
  MinLevel: number;
  FreeSpinCount: number;
  AdSpinCount: number;
  CooldownHours: number;
  RewardSlots: ExportRewardSlot[];
}

function transformRewardSlot(slot: RewardSlot): ExportRewardSlot {
  return {
    Probability: slot.probability,
    ItemId: slot.item_id,
    Amount: slot.amount,
    UpgradeMultiplier: slot.upgrade_multiplier,
  };
}

export function transformSpinConfigToExport(config: SpinConfig): ExportSpinConfig {
  return {
    Enabled: config.enabled,
    MinLevel: config.min_level,
    FreeSpinCount: config.free_spin_count,
    AdSpinCount: config.ad_spin_count,
    CooldownHours: config.cooldown_hours,
    RewardSlots: config.reward_slots.map(transformRewardSlot),
  };
}

