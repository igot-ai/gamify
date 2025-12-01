import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const CurrencyTypeEnum = z.enum(['soft', 'hard']);
export const ProductTypeEnum = z.enum(['Consumable', 'NonConsumable']);
export const ResourceTypeEnum = z.enum(['Currency', 'Item']);

// ============================================
// CURRENCY SCHEMA
// ============================================

export const currencySchema = z.object({
  id: z.string().min(1, 'Currency ID is required'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional().default(''),
  iconPath: z.string().optional().default(''),
  startingBalance: z.number().int().min(0, 'Starting balance must be 0 or greater').default(0),
  maxValue: z.number().int().min(0, 'Max value must be 0 or greater').default(0), // 0 = unlimited
  allowNegative: z.boolean().default(false),
  // Legacy fields for backward compatibility
  name: z.string().optional(),
  icon_url: z.string().optional(),
  type: CurrencyTypeEnum.optional(),
  starting_amount: z.number().optional(),
});

// ============================================
// INVENTORY ITEM SCHEMA
// ============================================

export const inventoryItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional().default(''),
  iconPath: z.string().optional().default(''),
  startingQuantity: z.number().int().min(0, 'Starting quantity must be 0 or greater').default(0),
  isStackable: z.boolean().default(true),
  maxStackSize: z.number().int().min(0, 'Max stack size must be 0 or greater').default(0), // 0 = unlimited
});

// ============================================
// RESOURCE REFERENCE (for costs/rewards)
// ============================================

export const resourceReferenceSchema = z.object({
  type: ResourceTypeEnum,
  resourceId: z.string().min(1, 'Resource ID is required'),
  amount: z.number().int().positive('Amount must be greater than 0'),
});

// ============================================
// BONUS SCHEMA (Conditional Rewards)
// ============================================

export const bonusSchema = z.object({
  id: z.string().optional(),
  type: ResourceTypeEnum,
  resourceId: z.string().min(1, 'Resource ID is required'),
  amount: z.number().int().positive('Amount must be greater than 0'),
  condition: z.string().optional(), // e.g., "first_purchase", "vip_member"
});

// ============================================
// VIRTUAL PURCHASE SCHEMA
// ============================================

export const virtualPurchaseSchema = z.object({
  id: z.string().min(1, 'Purchase ID is required'),
  name: z.string().min(1, 'Purchase name is required'),
  costs: z.array(resourceReferenceSchema).min(1, 'At least one cost is required'),
  rewards: z.array(resourceReferenceSchema).min(1, 'At least one reward is required'),
  bonuses: z.array(bonusSchema).optional().default([]),
});

// ============================================
// REAL PURCHASE (IAP) SCHEMA
// ============================================

export const realPurchaseSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  displayName: z.string().min(1, 'Display name is required'),
  productType: ProductTypeEnum,
  rewards: z.array(resourceReferenceSchema).min(1, 'At least one reward is required'),
  bonuses: z.array(bonusSchema).optional().default([]),
});

// ============================================
// ECONOMY SETTINGS SCHEMA
// ============================================

export const economySettingsSchema = z.object({
  enableRefundProcessing: z.boolean().default(false),
  remoteConfigKey: z.string().optional().default('ECONOMY_CONFIG'),
});

// ============================================
// LEGACY SCHEMAS (for backward compatibility)
// ============================================

export const currencyRewardSchema = z.object({
  currency_id: z.string().min(1, 'Currency ID is required'),
  amount: z.number().int().positive('Amount must be greater than 0'),
});

export const iapPackageSchema = z.object({
  id: z.string().min(1, 'Package ID is required'),
  product_id: z
    .string()
    .min(1, 'Product ID is required')
    .refine(
      (val) => val.startsWith('com.') || val.startsWith('android.') || val.startsWith('studio.'),
      'Product ID must start with com., android., or studio.'
    ),
  price: z.number().positive('Price must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  rewards: z.array(currencyRewardSchema).optional().default([]),
});

export const dailyRewardSchema = z.object({
  day: z.number().int().min(1, 'Day must be at least 1').max(30, 'Day must be at most 30'),
  rewards: z.array(currencyRewardSchema).min(1, 'At least one reward is required'),
});

// ============================================
// MAIN ECONOMY CONFIG SCHEMA
// ============================================

export const economyConfigSchema = z.object({
  // New structure
  currencies: z.array(currencySchema).default([]),
  inventoryItems: z.array(inventoryItemSchema).default([]),
  virtualPurchases: z.array(virtualPurchaseSchema).default([]),
  realPurchases: z.array(realPurchaseSchema).default([]),
  settings: economySettingsSchema.optional().default({
    enableRefundProcessing: false,
    remoteConfigKey: 'ECONOMY_CONFIG',
  }),
  // Legacy fields for backward compatibility
  iap_packages: z.array(iapPackageSchema).optional().default([]),
  daily_rewards: z.array(dailyRewardSchema).optional().default([]),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type CurrencyType = z.infer<typeof CurrencyTypeEnum>;
export type ProductType = z.infer<typeof ProductTypeEnum>;
export type ResourceType = z.infer<typeof ResourceTypeEnum>;

export type Currency = z.infer<typeof currencySchema>;
export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type ResourceReference = z.infer<typeof resourceReferenceSchema>;
export type Bonus = z.infer<typeof bonusSchema>;
export type VirtualPurchase = z.infer<typeof virtualPurchaseSchema>;
export type RealPurchase = z.infer<typeof realPurchaseSchema>;
export type EconomySettings = z.infer<typeof economySettingsSchema>;

// Legacy types
export type CurrencyReward = z.infer<typeof currencyRewardSchema>;
export type IAPPackage = z.infer<typeof iapPackageSchema>;
export type DailyReward = z.infer<typeof dailyRewardSchema>;

export type EconomyConfig = z.infer<typeof economyConfigSchema>;

// ============================================
// DEFAULT VALUES
// ============================================

export const defaultCurrency: Currency = {
  id: '',
  displayName: '',
  description: '',
  iconPath: '',
  startingBalance: 0,
  maxValue: 0,
  allowNegative: false,
};

export const defaultInventoryItem: InventoryItem = {
  id: '',
  displayName: '',
  description: '',
  iconPath: '',
  startingQuantity: 0,
  isStackable: true,
  maxStackSize: 0,
};

export const defaultResourceReference: ResourceReference = {
  type: 'Currency',
  resourceId: '',
  amount: 1,
};

export const defaultVirtualPurchase: VirtualPurchase = {
  id: '',
  name: '',
  costs: [],
  rewards: [],
  bonuses: [],
};

export const defaultRealPurchase: RealPurchase = {
  productId: '',
  displayName: '',
  productType: 'Consumable',
  rewards: [],
  bonuses: [],
};

export const defaultEconomySettings: EconomySettings = {
  enableRefundProcessing: false,
  remoteConfigKey: 'ECONOMY_CONFIG',
};

export const defaultEconomyConfig: EconomyConfig = {
  currencies: [],
  inventoryItems: [],
  virtualPurchases: [],
  realPurchases: [],
  settings: defaultEconomySettings,
  iap_packages: [],
  daily_rewards: [],
};
