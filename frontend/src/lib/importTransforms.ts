/**
 * Transform Unity-compatible format back to internal config formats.
 * 
 * These are the reverse of the export transforms - converts PascalCase Unity format
 * back to camelCase/snake_case internal structure.
 */

import type { SectionType } from '@/types/api';
import type { AdConfig, PlacementType, PlacementAction, BannerPosition, AdPlacementItem } from './validations/adConfig';
import type { NotificationConfig, NotificationChannel, NotificationStrategy, NotificationMessage } from './validations/notificationConfig';
import type { BoosterConfig } from './validations/boosterConfig';
import type { HintOfferConfig } from './validations/hintOfferConfig';
import type { RatingConfig } from './validations/ratingConfig';
import type { LinkConfig } from './validations/linkConfig';
import type { GameEconomyConfig } from './validations/gameEconomyConfig';
import type { ChapterRewardConfig } from './validations/chapterRewardConfig';
import type { ShopSettingsConfig } from './validations/shopSettingsConfig';
import type { SpinConfig, RewardSlot } from './validations/spinConfig';
import type { EconomyConfig, Currency, InventoryItem, VirtualPurchase, RealPurchase, ResourceType, ProductType } from './validations/economyConfig';
import type { GameConfig } from './validations/gameConfig';
import type { HapticConfig, HapticType } from './validations/hapticConfig';
import type { RemoveAdsConfig } from './validations/removeAdsConfig';
import type { TileBundleConfig } from './validations/tileBundleConfig';

// ============================================
// MAIN ENTRY POINT
// ============================================

/**
 * Transform imported data from Unity format to internal format based on section type.
 */
export function transformImportData(sectionType: SectionType, data: any): any {
  switch (sectionType) {
    case 'ads':
      return transformAdConfigFromImport(data);
    case 'notification':
      return transformNotificationConfigFromImport(data);
    case 'booster':
      return transformBoosterConfigFromImport(data);
    case 'hint_offer':
      return transformHintOfferConfigFromImport(data);
    case 'rating':
      return transformRatingConfigFromImport(data);
    case 'link':
      return transformLinkConfigFromImport(data);
    case 'game_economy':
      return transformGameEconomyConfigFromImport(data);
    case 'chapter_reward':
      return transformChapterRewardConfigFromImport(data);
    case 'shop_settings':
      return transformShopSettingsConfigFromImport(data);
    case 'spin':
      return transformSpinConfigFromImport(data);
    case 'economy':
      return transformEconomyConfigFromImport(data);
    case 'game':
      return transformGameConfigFromImport(data);
    case 'haptic':
      return transformHapticConfigFromImport(data);
    case 'remove_ads':
      return transformRemoveAdsConfigFromImport(data);
    case 'tile_bundle':
      return transformTileBundleConfigFromImport(data);
    default:
      // For other types, return as-is (they might not have transforms)
      return data;
  }
}

// ============================================
// AD CONFIG
// ============================================

const AD_FORMAT_REVERSE_MAP: Record<number, PlacementType> = {
  0: 'Banner',
  1: 'Interstitial',
  2: 'Rewarded',
};

const ACTION_REVERSE_MAP: Record<number, PlacementAction> = {
  0: 'Load',
  1: 'Show',
  2: 'LoadAndShow',
};

const BANNER_POSITION_REVERSE_MAP: Record<number, BannerPosition> = {
  0: 'Bottom',
  1: 'Top',
};

function isUnityAdConfig(data: any): boolean {
  return data && ('BannerAdUnitId' in data || 'InterstitialAdUnitId' in data || 'Placements' in data);
}

function transformAdConfigFromImport(data: any): AdConfig {
  if (!isUnityAdConfig(data)) {
    return data as AdConfig;
  }

  return {
    adUnitIds: {
      banner: data.BannerAdUnitId ?? '',
      interstitial: data.InterstitialAdUnitId ?? '',
      rewarded: data.RewardedAdUnitId ?? '',
    },
    advancedSettings: {
      autoHideBanner: data.AutoHideBanner ?? true,
      bannerPosition: BANNER_POSITION_REVERSE_MAP[data.BannerPosition] ?? 'Bottom',
      bannerRefreshRate: data.BannerRefreshRate ?? 0,
      bannerMemoryThreshold: data.BannerMemoryThreshold ?? 1536,
      destroyBannerOnLowMemory: data.DestroyBannerOnLowMemory ?? true,
      preloadInterstitial: data.PreloadInterstitial ?? false,
      preloadRewarded: data.PreloadRewarded ?? true,
    },
    optionalSettings: {
      enableConsentFlow: data.EnableConsentFlow ?? true,
    },
    placements: (data.Placements ?? []).map((p: any): AdPlacementItem => ({
      name: p.PlacementId ?? '',
      type: AD_FORMAT_REVERSE_MAP[p.AdFormat] ?? 'Interstitial',
      action: ACTION_REVERSE_MAP[p.Action] ?? 'LoadAndShow',
      minLevel: p.MinLevel ?? 1,
      timeBetween: p.TimeBetween ?? 0,
      showLoading: p.ShowLoading ?? false,
      timeOut: p.TimeOut ?? 30,
      retry: p.Retry ?? 0,
      showAdNotice: p.ShowAdNotice ?? false,
      delayTime: p.DelayTime ?? 0,
      customAdUnitId: p.CustomAdUnitId ?? '',
    })),
  };
}

// ============================================
// NOTIFICATION CONFIG
// ============================================

function isUnityNotificationConfig(data: any): boolean {
  return data && ('Enable' in data || 'Strategies' in data || 'Channels' in data);
}

function transformNotificationConfigFromImport(data: any): NotificationConfig {
  if (!isUnityNotificationConfig(data)) {
    return data as NotificationConfig;
  }

  return {
    enable: data.Enable ?? true,
    channels: (data.Channels ?? []).map((c: any): NotificationChannel => ({
      id: c.Id ?? '',
      name: c.Name ?? '',
      description: c.Description ?? '',
      defaultBadge: c.DefaultBadge ?? 0,
      importance: c.Importance ?? 3,
      enableLights: c.EnableLights ?? true,
      enableVibration: c.EnableVibration ?? true,
      canBypassDnd: c.CanBypassDnd ?? false,
      canShowBadge: c.CanShowBadge ?? true,
      lockScreenVisibility: c.LockScreenVisibility ?? 1,
    })),
    strategies: (data.Strategies ?? []).map((s: any): NotificationStrategy => ({
      id: s.Id ?? '',
      name: s.Name ?? '',
      mode: s.Mode ?? 0,
      delaySeconds: s.DelaySeconds ?? 0,
      fixedHour: s.FixedHour ?? 12,
      fixedMinute: s.FixedMinute ?? 0,
      fixedDaysOffset: s.FixedDaysOffset ?? 0,
      repeatPolicy: s.RepeatPolicy ?? 0,
      repeatSeconds: s.RepeatSeconds ?? 0,
      active: s.Active ?? true,
      autoScheduled: s.AutoScheduled ?? false,
      schedulingMode: s.SchedulingMode ?? 0,
      defaultChannelId: s.DefaultChannelId ?? '',
      notifications: (s.Notifications ?? []).map((n: any): NotificationMessage => ({
        title: n.Title ?? '',
        body: n.Body ?? '',
        payload: n.Payload ?? '',
        androidChannelId: n.AndroidChannelId ?? '',
        iosCategory: n.IosCategory ?? '',
        offsetSeconds: n.OffsetSeconds ?? 0,
      })),
    })),
  };
}

// ============================================
// BOOSTER CONFIG
// ============================================

function isUnityBoosterConfig(data: any): boolean {
  return data && ('Boosters' in data || 'AutoUseAfterAds' in data);
}

function transformBoosterConfigFromImport(data: any): BoosterConfig {
  if (!isUnityBoosterConfig(data)) {
    return data as BoosterConfig;
  }

  const transformBoosterItem = (item: any) => ({
    unlock_level: item?.UnlockLevel ?? 1,
    refill_amount: item?.RefillAmount ?? 1,
    start: item?.Start ?? 2,
  });

  return {
    undo: transformBoosterItem(data.Boosters?.Undo),
    hint: transformBoosterItem(data.Boosters?.Hint),
    shuffle: transformBoosterItem(data.Boosters?.Shuffle),
    auto_use_after_ads: data.AutoUseAfterAds ?? true,
    time_auto_suggestion: data.TimeAutoSuggestion ?? 5,
    auto_suggestion_enabled: data.AutoSuggestionEnabled ?? true,
  };
}

// ============================================
// HINT OFFER CONFIG
// ============================================

function isUnityHintOfferConfig(data: any): boolean {
  return data && ('Enabled' in data || 'Duration' in data || 'DelayBeforeCountdown' in data);
}

function transformHintOfferConfigFromImport(data: any): HintOfferConfig {
  if (!isUnityHintOfferConfig(data)) {
    return data as HintOfferConfig;
  }

  return {
    enabled: data.Enabled ?? true,
    duration: data.Duration ?? 5,
    delay_before_countdown: data.DelayBeforeCountdown ?? 0,
    min_level: data.MinLevel ?? 1,
    idle_time_trigger: data.IdleTimeTrigger ?? 10,
    max_appearances_per_level: data.MaxAppearancesPerLevel ?? 3,
  };
}

// ============================================
// RATING CONFIG
// ============================================

function isUnityRatingConfig(data: any): boolean {
  return data && ('Enabled' in data || 'MinStarRequired' in data || 'IntervalHours' in data);
}

function transformRatingConfigFromImport(data: any): RatingConfig {
  if (!isUnityRatingConfig(data)) {
    return data as RatingConfig;
  }

  return {
    enabled: data.Enabled ?? true,
    min_star_required: data.MinStarRequired ?? 4,
    interval_hours: data.IntervalHours ?? 48,
    min_levels: data.MinLevels ?? 9,
    max_show_count: data.MaxShowCount ?? 3,
  };
}

// ============================================
// LINK CONFIG
// ============================================

function isUnityLinkConfig(data: any): boolean {
  return data && ('PrivacyLink' in data || 'TermsLink' in data);
}

function transformLinkConfigFromImport(data: any): LinkConfig {
  if (!isUnityLinkConfig(data)) {
    return data as LinkConfig;
  }

  return {
    privacy_link: data.PrivacyLink ?? '',
    terms_link: data.TermsLink ?? '',
  };
}

// ============================================
// GAME ECONOMY CONFIG
// ============================================

function isUnityGameEconomyConfig(data: any): boolean {
  return data && ('ReviveCoinCost' in data || 'AdLevelCompleteCoinReward' in data);
}

function transformGameEconomyConfigFromImport(data: any): GameEconomyConfig {
  if (!isUnityGameEconomyConfig(data)) {
    return data as GameEconomyConfig;
  }

  return {
    revive_coin_cost: data.ReviveCoinCost ?? 300,
    ad_level_complete_coin_reward: data.AdLevelCompleteCoinReward ?? 50,
    scenery_complete_coin_reward: data.SceneryCompleteCoinReward ?? 50,
  };
}

// ============================================
// CHAPTER REWARD CONFIG
// ============================================

function isUnityChapterRewardConfig(data: any): boolean {
  return data && ('Undo' in data || 'Hint' in data || 'Shuffle' in data);
}

function transformChapterRewardConfigFromImport(data: any): ChapterRewardConfig {
  if (!isUnityChapterRewardConfig(data)) {
    return data as ChapterRewardConfig;
  }

  return {
    undo: data.Undo ?? 1,
    hint: data.Hint ?? 1,
    shuffle: data.Shuffle ?? 1,
  };
}

// ============================================
// SHOP SETTINGS CONFIG
// ============================================

function isUnityShopSettingsConfig(data: any): boolean {
  return data && ('Enabled' in data || 'RestoreMinLevel' in data);
}

function transformShopSettingsConfigFromImport(data: any): ShopSettingsConfig {
  if (!isUnityShopSettingsConfig(data)) {
    return data as ShopSettingsConfig;
  }

  return {
    enabled: data.Enabled ?? true,
    restore_min_level: data.RestoreMinLevel ?? 1,
  };
}

// ============================================
// SPIN CONFIG
// ============================================

function isUnitySpinConfig(data: any): boolean {
  return data && ('Enabled' in data || 'RewardSlots' in data || 'SpinCost' in data);
}

function transformSpinConfigFromImport(data: any): SpinConfig {
  if (!isUnitySpinConfig(data)) {
    return data as SpinConfig;
  }

  return {
    enabled: data.Enabled ?? true,
    spin_cost: data.SpinCost ?? 100,
    free_spin_interval_hours: data.FreeSpinIntervalHours ?? 24,
    min_level: data.MinLevel ?? 1,
    reward_slots: (data.RewardSlots ?? []).map((slot: any): RewardSlot => ({
      reward_type: slot.RewardType === 0 ? 'Currency' : 'Item',
      reward_id: slot.RewardId ?? '',
      amount: slot.Amount ?? 1,
      weight: slot.Weight ?? 1,
    })),
  };
}

// ============================================
// ECONOMY CONFIG
// ============================================

const RESOURCE_TYPE_REVERSE_MAP: Record<number, ResourceType> = {
  0: 'Currency',
  1: 'Item',
};

const PRODUCT_TYPE_REVERSE_MAP: Record<number, ProductType> = {
  0: 'Consumable',
  1: 'NonConsumable',
};

function isUnityEconomyConfig(data: any): boolean {
  return data && ('CurrencyDefinitions' in data || 'InventoryItemDefinitions' in data);
}

function transformEconomyConfigFromImport(data: any): EconomyConfig {
  if (!isUnityEconomyConfig(data)) {
    return data as EconomyConfig;
  }

  return {
    currencies: (data.CurrencyDefinitions ?? []).map((c: any): Currency => ({
      id: c.Id ?? '',
      displayName: c.DisplayName ?? '',
      description: c.Description ?? '',
      iconPath: c.IconPath ?? '',
      startingBalance: c.DefaultBalance ?? 0,
      maxValue: c.MaxValue ?? 0,
      allowNegative: c.AllowNegative ?? false,
    })),
    inventoryItems: (data.InventoryItemDefinitions ?? []).map((i: any): InventoryItem => ({
      id: i.Id ?? '',
      displayName: i.DisplayName ?? '',
      description: i.Description ?? '',
      iconPath: i.IconPath ?? '',
      startingQuantity: i.DefaultQuantity ?? 0,
      isStackable: i.IsStackable ?? true,
      maxStackSize: i.MaxStackSize ?? 0,
    })),
    virtualPurchases: (data.VirtualPurchaseDefinitions ?? []).map((p: any): VirtualPurchase => ({
      id: p.Id ?? '',
      name: p.Name ?? '',
      costs: (p.Costs ?? []).map((c: any) => ({
        type: RESOURCE_TYPE_REVERSE_MAP[c.ResourceType] ?? 'Currency',
        resourceId: c.ResourceId ?? '',
        amount: c.Amount ?? 1,
      })),
      rewards: (p.Rewards ?? []).map((r: any) => ({
        type: RESOURCE_TYPE_REVERSE_MAP[r.ResourceType] ?? 'Currency',
        resourceId: r.ResourceId ?? '',
        amount: r.Amount ?? 1,
      })),
      bonuses: [],
    })),
    realPurchases: (data.RealMoneyProductDefinitions ?? []).map((p: any): RealPurchase => ({
      productId: p.ProductId ?? '',
      productType: PRODUCT_TYPE_REVERSE_MAP[p.ProductType] ?? 'Consumable',
      displayName: p.Name ?? '',
      rewards: (p.Rewards ?? []).map((r: any) => ({
        type: RESOURCE_TYPE_REVERSE_MAP[r.ResourceType] ?? 'Currency',
        resourceId: r.ResourceId ?? '',
        amount: r.Amount ?? 1,
      })),
      bonuses: [],
    })),
    settings: {
      enableRefundProcessing: data.EnableRefundProcessing ?? false,
      remoteConfigKey: 'ECONOMY_CONFIG',
    },
  };
}

// ============================================
// GAME CONFIG
// ============================================

function isUnityGameConfig(data: any): boolean {
  return data && ('GameLogic' in data || 'ViewConfig' in data);
}

function transformGameConfigFromImport(data: any): GameConfig {
  if (!isUnityGameConfig(data)) {
    return data as GameConfig;
  }

  return {
    gameLogic: {
      gameLogicConfig: {
        matchCount: data.GameLogic?.GameLogicConfig?.MatchCount ?? 3,
        countUndoTileRevive: data.GameLogic?.GameLogicConfig?.CountUndoTileRevive ?? 1,
        countShuffleTileRevive: data.GameLogic?.GameLogicConfig?.CountShuffleTileRevive ?? 1,
        countSlotHolder: data.GameLogic?.GameLogicConfig?.CountSlotHolder ?? 7,
        warningThreshold: data.GameLogic?.GameLogicConfig?.WarningThreshold ?? 5,
      },
      combo: {
        matchEffect: data.GameLogic?.Combo?.MatchEffect ?? 3,
        maxNoMatch: data.GameLogic?.Combo?.MaxNoMatch ?? 5,
      },
    },
    viewConfig: {
      gridView: {
        tileSize: {
          x: data.ViewConfig?.GridView?.TileSize?.X ?? 1,
          y: data.ViewConfig?.GridView?.TileSize?.Y ?? 1,
        },
      },
      holderView: {
        slotSize: {
          x: data.ViewConfig?.HolderView?.SlotSize?.X ?? 1,
          y: data.ViewConfig?.HolderView?.SlotSize?.Y ?? 1,
        },
        slotSpace: data.ViewConfig?.HolderView?.SlotSpace ?? 0.1,
        ratioBetweenTwoTile: data.ViewConfig?.HolderView?.RatioBetweenTwoTile ?? 0.5,
        slotYPadding: data.ViewConfig?.HolderView?.SlotYPadding ?? 0,
        tileInHolderYPadding: data.ViewConfig?.HolderView?.TileInHolderYPadding ?? 0,
      },
    },
  };
}

// ============================================
// HAPTIC CONFIG
// ============================================

function isUnityHapticConfig(data: any): boolean {
  return data && ('Soft' in data || 'Light' in data || 'Medium' in data || 'Heavy' in data);
}

function transformHapticTypeFromImport(data: any): HapticType {
  return {
    android: {
      duration: data?.Android?.Duration ?? 50,
      amplitude: data?.Android?.Amplitude ?? 100,
    },
    ios: {
      intensity: data?.IOS?.Intensity ?? 0.5,
      sharpness: data?.IOS?.Sharpness ?? 0.5,
      duration: data?.IOS?.Duration ?? 0.1,
    },
  };
}

function transformHapticConfigFromImport(data: any): HapticConfig {
  if (!isUnityHapticConfig(data)) {
    return data as HapticConfig;
  }

  return {
    soft: transformHapticTypeFromImport(data.Soft),
    light: transformHapticTypeFromImport(data.Light),
    medium: transformHapticTypeFromImport(data.Medium),
    heavy: transformHapticTypeFromImport(data.Heavy),
    button: transformHapticTypeFromImport(data.Button),
    success: transformHapticTypeFromImport(data.Success),
    error: transformHapticTypeFromImport(data.Error),
  };
}

// ============================================
// REMOVE ADS CONFIG
// ============================================

function isUnityRemoveAdsConfig(data: any): boolean {
  return data && ('AdWatchedTrigger' in data || 'DaysPlayedTrigger' in data || 'CooldownPopupHours' in data);
}

function transformRemoveAdsConfigFromImport(data: any): RemoveAdsConfig {
  if (!isUnityRemoveAdsConfig(data)) {
    return data as RemoveAdsConfig;
  }

  return {
    enabled: data.Enabled ?? true,
    minLevel: data.MinLevel ?? 1,
    adWatchedTrigger: data.AdWatchedTrigger ?? 5,
    daysPlayedTrigger: data.DaysPlayedTrigger ?? 3,
    durationHours: data.DurationHours ?? 24,
    maxLifetimeShows: data.MaxLifetimeShows ?? 10,
    maxSessionShows: data.MaxSessionShows ?? 3,
    cooldownPopupHours: data.CooldownPopupHours ?? 12,
    cooldownOfferHours: data.CooldownOfferHours ?? 24,
  };
}

// ============================================
// TILE BUNDLE CONFIG
// ============================================

function isUnityTileBundleConfig(data: any): boolean {
  return data && ('Discount' in data || 'SessionsPlayedTrigger' in data);
}

function transformTileBundleConfigFromImport(data: any): TileBundleConfig {
  if (!isUnityTileBundleConfig(data)) {
    return data as TileBundleConfig;
  }

  return {
    enabled: data.Enabled ?? true,
    discount: data.Discount ?? 20,
    minLevel: data.MinLevel ?? 1,
    daysPlayedTrigger: data.DaysPlayedTrigger ?? 3,
    sessionsPlayedTrigger: data.SessionsPlayedTrigger ?? 5,
    durationHours: data.DurationHours ?? 24,
    maxLifetimeShows: data.MaxLifetimeShows ?? 10,
    maxSessionShows: data.MaxSessionShows ?? 3,
    cooldownPopupHours: data.CooldownPopupHours ?? 12,
    cooldownOfferHours: data.CooldownOfferHours ?? 24,
  };
}

