import { z } from 'zod';

// ============================================
// REWARD SLOT SCHEMA
// ============================================

export const rewardSlotSchema = z.object({
  probability: z.number().min(0, 'Probability must be 0 or greater').max(1, 'Probability must be 1 or less'),
  item_id: z.string().min(1, 'Item ID is required'),
  amount: z.number().int().min(1, 'Amount must be at least 1'),
  upgrade_multiplier: z.number().min(1, 'Upgrade multiplier must be at least 1'),
});

export type RewardSlot = z.infer<typeof rewardSlotSchema>;

// ============================================
// SPIN CONFIG SCHEMA
// ============================================

export const spinConfigSchema = z.object({
  enabled: z.boolean(),
  free_spin_count: z.number().int().min(0, 'Free spin count must be 0 or greater'),
  ad_spin_count: z.number().int().min(0, 'Ad spin count must be 0 or greater'),
  cooldown_hours: z.number().min(0, 'Cooldown hours must be 0 or greater'),
  min_level: z.number().int().min(1, 'Minimum level must be at least 1'),
  reward_slots: z.array(rewardSlotSchema),
});

export type SpinConfig = z.infer<typeof spinConfigSchema>;

// ============================================
// DEFAULT VALUES
// ============================================

export const defaultRewardSlot: RewardSlot = {
  probability: 0.25,
  item_id: '',
  amount: 1,
  upgrade_multiplier: 2,
};

export const defaultSpinConfig: SpinConfig = {
  enabled: true,
  free_spin_count: 1,
  ad_spin_count: 4,
  cooldown_hours: 24,
  min_level: 20,
  reward_slots: [],
};

