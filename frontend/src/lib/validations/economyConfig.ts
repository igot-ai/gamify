import { z } from 'zod';

// Currency Type enum
export const CurrencyTypeEnum = z.enum(['soft', 'hard']);

// Currency schema
export const currencySchema = z.object({
  id: z.string().min(1, 'Currency ID is required'),
  name: z.string().min(1, 'Currency name is required'),
  icon_url: z.string().url().optional().or(z.literal('')),
  type: CurrencyTypeEnum,
  starting_amount: z.number().int().min(0, 'Starting amount must be 0 or greater'),
});

// Currency Reward schema
export const currencyRewardSchema = z.object({
  currency_id: z.string().min(1, 'Currency ID is required'),
  amount: z.number().int().positive('Amount must be greater than 0'),
});

// IAP Package schema
export const iapPackageSchema = z.object({
  id: z.string().min(1, 'Package ID is required'),
  product_id: z
    .string()
    .min(1, 'Product ID is required')
    .refine(
      (val) => val.startsWith('com.') || val.startsWith('android.'),
      'Product ID must start with com. or android.'
    ),
  price: z.number().positive('Price must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  rewards: z.array(currencyRewardSchema).min(1, 'At least one reward is required'),
});

// Daily Reward schema
export const dailyRewardSchema = z.object({
  day: z.number().int().min(1, 'Day must be at least 1').max(30, 'Day must be at most 30'),
  rewards: z.array(currencyRewardSchema).min(1, 'At least one reward is required'),
});

// Economy Config schema
export const economyConfigSchema = z
  .object({
    currencies: z.array(currencySchema).min(1, 'At least one currency is required'),
    iap_packages: z.array(iapPackageSchema),
    daily_rewards: z.array(dailyRewardSchema),
  })
  .refine(
    (data) => {
      const days = data.daily_rewards.map((r) => r.day);
      return days.length === new Set(days).size;
    },
    {
      message: 'Daily rewards must have unique day numbers',
      path: ['daily_rewards'],
    }
  );

export type Currency = z.infer<typeof currencySchema>;
export type CurrencyReward = z.infer<typeof currencyRewardSchema>;
export type IAPPackage = z.infer<typeof iapPackageSchema>;
export type DailyReward = z.infer<typeof dailyRewardSchema>;
export type EconomyConfig = z.infer<typeof economyConfigSchema>;

