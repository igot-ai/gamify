import { z } from 'zod';

export const ratingConfigSchema = z.object({
  enabled: z.boolean(),
  min_star_required: z.number().int().min(1).max(5, 'Star rating must be between 1 and 5'),
  interval_hours: z.number().min(0, 'Interval must be 0 or greater'),
  min_levels: z.number().int().min(1, 'Minimum levels must be at least 1'),
  max_show_count: z.number().int().min(1, 'Max show count must be at least 1'),
});

export type RatingConfig = z.infer<typeof ratingConfigSchema>;

