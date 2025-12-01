import { z } from 'zod';

export const hintOfferConfigSchema = z.object({
  enabled: z.boolean(),
  duration: z.number().int().min(1, 'Duration must be at least 1'),
  delay_before_countdown: z.number().int().min(0, 'Delay must be 0 or greater'),
  min_level: z.number().int().min(1, 'Minimum level must be at least 1'),
  idle_time_trigger: z.number().int().min(1, 'Idle time trigger must be at least 1'),
  max_appearances_per_level: z.number().int().min(1, 'Max appearances must be at least 1'),
});

export type HintOfferConfig = z.infer<typeof hintOfferConfigSchema>;

export const defaultHintOfferConfig: HintOfferConfig = {
  enabled: true,
  duration: 20,
  delay_before_countdown: 2,
  min_level: 10,
  idle_time_trigger: 20,
  max_appearances_per_level: 2,
};

