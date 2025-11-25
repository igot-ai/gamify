import { z } from 'zod';

export const tileBundleConfigSchema = z.object({
  enabled: z.boolean(),
  discount: z.number().int().min(0, 'Discount must be 0 or greater').max(100, 'Discount cannot exceed 100'),
  min_level: z.number().int().min(1, 'Min level must be at least 1'),
  days_played_trigger: z.number().int().min(0, 'Days played trigger must be 0 or greater'),
  sessions_played_trigger: z.number().int().min(0, 'Sessions played trigger must be 0 or greater'),
  duration_hours: z.number().int().min(1, 'Duration must be at least 1 hour'),
  max_lifetime_shows: z.number().int().min(0, 'Max lifetime shows must be 0 or greater'),
  max_session_shows: z.number().int().min(0, 'Max session shows must be 0 or greater'),
  cooldown_popup_hours: z.number().int().min(0, 'Cooldown popup hours must be 0 or greater'),
  cooldown_offer_hours: z.number().int().min(0, 'Cooldown offer hours must be 0 or greater'),
});

export type TileBundleConfig = z.infer<typeof tileBundleConfigSchema>;

