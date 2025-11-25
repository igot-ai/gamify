import { z } from 'zod';

// Frequency Cap schema
export const frequencyCapSchema = z.object({
  count: z.number().int().positive('Count must be greater than 0'),
  period_minutes: z.number().int().positive('Period must be greater than 0'),
});

// Ad Placement schema
export const adPlacementSchema = z.object({
  enabled: z.boolean().default(true),
  frequency_cap: frequencyCapSchema,
  reward: z.record(z.string(), z.any()).default({}),
});

// Ad Network schema
export const adNetworkSchema = z.object({
  id: z.string().min(1, 'Network ID is required'),
  enabled: z.boolean().default(true),
  app_id: z.string().min(1, 'App ID is required'),
  priority: z.number().int().min(1, 'Priority must be at least 1'),
});

// Ad Config schema
export const adConfigSchema = z.object({
  networks: z.array(adNetworkSchema).min(1, 'At least one ad network is required'),
  interstitial: adPlacementSchema,
  rewarded: adPlacementSchema,
  banner: adPlacementSchema,
  remove_ads_product_id: z.string().default(''),
});

export type FrequencyCap = z.infer<typeof frequencyCapSchema>;
export type AdPlacement = z.infer<typeof adPlacementSchema>;
export type AdNetwork = z.infer<typeof adNetworkSchema>;
export type AdConfig = z.infer<typeof adConfigSchema>;

