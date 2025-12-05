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
    Probability: slot.probability ?? 0,
    ItemId: slot.item_id ?? '',
    Amount: slot.amount ?? 0,
    UpgradeMultiplier: slot.upgrade_multiplier ?? 1,
  };
}

export function transformSpinConfigToExport(config: SpinConfig): ExportSpinConfig {
  if (!config) {
    return {
      Enabled: true,
      MinLevel: 1,
      FreeSpinCount: 1,
      AdSpinCount: 3,
      CooldownHours: 24,
      RewardSlots: [],
    };
  }
  return {
    Enabled: config.enabled ?? true,
    MinLevel: config.min_level ?? 1,
    FreeSpinCount: config.free_spin_count ?? 1,
    AdSpinCount: config.ad_spin_count ?? 3,
    CooldownHours: config.cooldown_hours ?? 24,
    RewardSlots: (config.reward_slots || []).filter(Boolean).map(transformRewardSlot),
  };
}

