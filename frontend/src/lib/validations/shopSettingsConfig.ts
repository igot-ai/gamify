import { z } from 'zod';

export const shopSettingsConfigSchema = z.object({
  enabled: z.boolean(),
  restore_min_level: z.number().int().min(1, 'Restore min level must be at least 1'),
});

export type ShopSettingsConfig = z.infer<typeof shopSettingsConfigSchema>;

export const defaultShopSettingsConfig: ShopSettingsConfig = {
  enabled: false,
  restore_min_level: 0,
};

