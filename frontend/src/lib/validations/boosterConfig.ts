import { z } from 'zod';

const boosterItemSchema = z.object({
  unlock_level: z.number().int().min(1, 'Unlock level must be at least 1'),
  refill_amount: z.number().int().min(0, 'Refill amount must be 0 or greater'),
  start: z.number().int().min(0, 'Start amount must be 0 or greater'),
});

export const boosterConfigSchema = z.object({
  undo: boosterItemSchema,
  hint: boosterItemSchema,
  shuffle: boosterItemSchema,
  auto_use_after_ads: z.boolean(),
});

export type BoosterItem = z.infer<typeof boosterItemSchema>;
export type BoosterConfig = z.infer<typeof boosterConfigSchema>;

