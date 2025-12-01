import { z } from 'zod';

// ============================================
// Ad Unit IDs Schema
// ============================================
export const adUnitIdsSchema = z.object({
  banner: z.string().default(''),
  interstitial: z.string().default(''),
  rewarded: z.string().default(''),
});

// ============================================
// Placement Schema
// ============================================
export const placementTypeEnum = z.enum(['Banner', 'Interstitial', 'Rewarded']);
export const placementActionEnum = z.enum(['Load', 'Show', 'LoadAndShow']);

export const adPlacementItemSchema = z.object({
  name: z.string().min(1, 'Placement name is required'),
  type: placementTypeEnum,
  action: placementActionEnum,
  enabled: z.boolean().default(true),
  minLevel: z.number().int().min(0).default(1),
  timeBetween: z.number().int().min(0).default(0),
  showLoading: z.boolean().default(false),
  timeOut: z.number().int().min(0).default(30),
  retry: z.number().int().min(0).default(0),
  showAdNotice: z.boolean().default(false),
  delayTime: z.number().int().min(0).default(0),
  customAdUnitId: z.string().default(''),
});

// ============================================
// Advanced Settings Schema
// ============================================
export const bannerPositionEnum = z.enum(['Top', 'Bottom']);

export const advancedSettingsSchema = z.object({
  autoHideBanner: z.boolean().default(true),
  preloadInterstitial: z.boolean().default(false),
  preloadRewarded: z.boolean().default(true),
  bannerPosition: bannerPositionEnum.default('Bottom'),
  bannerRefreshRate: z.number().int().min(0).default(0),
  bannerMemoryThreshold: z.number().int().min(0).default(1536),
  destroyBannerOnLowMemory: z.boolean().default(true),
});

// ============================================
// Optional Settings Schema
// ============================================
export const optionalSettingsSchema = z.object({
  enableConsentFlow: z.boolean().default(true),
  forceTestMode: z.boolean().default(false),
  removeAdsEnabled: z.boolean().default(false),
});

// ============================================
// Legacy Schemas (kept for backward compatibility)
// ============================================
export const frequencyCapSchema = z.object({
  count: z.number().int().positive('Count must be greater than 0'),
  period_minutes: z.number().int().positive('Period must be greater than 0'),
});

export const adPlacementSchema = z.object({
  enabled: z.boolean(),
  frequency_cap: frequencyCapSchema,
  reward: z.record(z.string(), z.any()).default({}),
});

export const adNetworkSchema = z.object({
  id: z.string().min(1, 'Network ID is required'),
  enabled: z.boolean(),
  app_id: z.string().min(1, 'App ID is required'),
  priority: z.number().int().min(1, 'Priority must be at least 1'),
});

// ============================================
// Main Ad Config Schema
// ============================================
export const adConfigSchema = z.object({
  // New fields from plan
  adUnitIds: adUnitIdsSchema.default({
    banner: '',
    interstitial: '',
    rewarded: '',
  }),
  placements: z.array(adPlacementItemSchema).default([]),
  advancedSettings: advancedSettingsSchema.default({
    preloadInterstitial: false,
    preloadRewarded: true,
    bannerPosition: 'Bottom',
    bannerRefreshRate: 0,
    bannerMemoryThreshold: 1536,
    destroyBannerOnLowMemory: true,
  }),
  optionalSettings: optionalSettingsSchema.default({
    enableConsentFlow: true,
    forceTestMode: false,
    removeAdsEnabled: false,
  }),
  
  // Legacy fields (kept for backward compatibility)
  networks: z.array(adNetworkSchema).default([]),
  interstitial: adPlacementSchema.optional(),
  rewarded: adPlacementSchema.optional(),
  banner: adPlacementSchema.optional(),
  remove_ads_product_id: z.string().default(''),
});

// ============================================
// Type Exports
// ============================================
export type AdUnitIds = z.infer<typeof adUnitIdsSchema>;
export type PlacementType = z.infer<typeof placementTypeEnum>;
export type PlacementAction = z.infer<typeof placementActionEnum>;
export type AdPlacementItem = z.infer<typeof adPlacementItemSchema>;
export type BannerPosition = z.infer<typeof bannerPositionEnum>;
export type AdvancedSettings = z.infer<typeof advancedSettingsSchema>;
export type OptionalSettings = z.infer<typeof optionalSettingsSchema>;
export type FrequencyCap = z.infer<typeof frequencyCapSchema>;
export type AdPlacement = z.infer<typeof adPlacementSchema>;
export type AdNetwork = z.infer<typeof adNetworkSchema>;
export type AdConfig = z.infer<typeof adConfigSchema>;

// ============================================
// Default Config
// ============================================
export const defaultAdConfig: AdConfig = {
  adUnitIds: {
    banner: '',
    interstitial: '',
    rewarded: '',
  },
  placements: [],
  advancedSettings: {
    autoHideBanner: true,
    preloadInterstitial: false,
    preloadRewarded: true,
    bannerPosition: 'Bottom',
    bannerRefreshRate: 0,
    bannerMemoryThreshold: 1536,
    destroyBannerOnLowMemory: true,
  },
  optionalSettings: {
    enableConsentFlow: true,
    forceTestMode: false,
    removeAdsEnabled: false,
  },
  networks: [],
  remove_ads_product_id: '',
};

// Default placement for adding new items
export const defaultPlacement: AdPlacementItem = {
  name: '',
  type: 'Banner',
  action: 'LoadAndShow',
  enabled: true,
  minLevel: 1,
  timeBetween: 0,
  showLoading: false,
  timeOut: 30,
  retry: 0,
  showAdNotice: false,
  delayTime: 0,
  customAdUnitId: '',
};
