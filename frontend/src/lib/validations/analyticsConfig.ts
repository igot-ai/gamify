import { z } from 'zod';

export const analyticsConfigSchema = z.object({
  dev_key: z.string().min(1, 'Dev Key is required'),
  app_id: z.string().min(1, 'App ID is required'),
});

export type AnalyticsConfig = z.infer<typeof analyticsConfigSchema>;

