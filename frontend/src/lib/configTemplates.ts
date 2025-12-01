import type { ShopConfig } from '@/lib/validations/shopConfig';
import type { EconomyConfig } from '@/lib/validations/economyConfig';

export type ConfigType = 
  | 'economy'
  | 'shop'
  | 'ads'
  | 'notifications'
  | 'boosters'
  | 'chapter_reward'
  | 'game'
  | 'analytics'
  | 'ux'
  | 'haptic'
  | 'remove_ads'
  | 'tile_bundle';

/**
 * Default templates for each config type
 */
export const configTemplates: Record<ConfigType, any> = {
  economy: {
    currencies: [
      {
        id: 'coins',
        name: 'Coins',
        type: 'soft',
        starting_amount: 1000,
        icon_url: '',
      },
      {
        id: 'gems',
        name: 'Gems',
        type: 'hard',
        starting_amount: 50,
        icon_url: '',
      },
    ],
    iap_packages: [
      {
        id: 'starter_pack',
        product_id: 'com.sunstudio.game.starter',
        price: 4.99,
        currency: 'USD',
        rewards: [
          { currency_id: 'gems', amount: 500 },
          { currency_id: 'coins', amount: 5000 },
        ],
      },
    ],
    daily_rewards: [],
  } as EconomyConfig,

  shop: {
    categories: [
      {
        id: 'currency_packs',
        name: 'Currency Packs',
        icon_url: '',
        items: [
          {
            id: '50_gems',
            name: '50 Gems',
            description: 'Get 50 premium gems',
            icon_url: '',
            price: { currency_id: 'gems', amount: 4.99 },
            rewards: [{ currency_id: 'gems', amount: 50 }],
            limited_time: false,
            expires_at: '',
            purchase_limit: undefined,
          },
        ],
      },
    ],
    featured_items: [],
    rotation_enabled: false,
  } as ShopConfig,

  ads: {
    networks: [
      {
        id: 'admob',
        enabled: true,
        app_id: 'ca-app-pub-xxx',
        priority: 1,
      },
      {
        id: 'unity',
        enabled: true,
        app_id: 'unity-app-id',
        priority: 2,
      },
    ],
    interstitial: {
      enabled: true,
      frequency_cap: { count: 3, period_minutes: 60 },
    },
    rewarded: {
      enabled: true,
      frequency_cap: { count: 10, period_minutes: 1440 },
      reward: { currency_id: 'coins', amount: 200 },
    },
    banner: {
      enabled: false,
      frequency_cap: { count: 1, period_minutes: 1 },
    },
    remove_ads_product_id: 'com.sunstudio.game.noads',
  },

  notifications: {
    push_enabled: true,
    local_notifications: [
      {
        id: 'daily_reward',
        title: 'Daily Reward Available!',
        body: 'Come back and claim your daily reward',
        trigger_after_hours: 24,
        repeat: 'daily',
        enabled: true,
      },
    ],
    push_notifications: [],
    firebase_config: {
      sender_id: '',
      server_key: '',
      topics: [],
    },
  },

  boosters: {
    boosters: [
      {
        id: 'extra_moves',
        name: 'Extra Moves',
        description: 'Get 5 extra moves',
        icon_url: '',
        type: 'consumable',
        effect: { type: 'move_bonus', value: 5 },
        price: { currency_id: 'coins', amount: 100 },
        stackable: false,
      },
    ],
  },

  chapter_reward: {
    chapters: [
      {
        id: 'chapter_1',
        name: 'Chapter 1',
        level_range: { start: 1, end: 10 },
        completion_rewards: [{ currency_id: 'coins', amount: 100 }],
        star_rewards: [
          { stars_required: 1, rewards: [{ currency_id: 'coins', amount: 50 }] },
          { stars_required: 2, rewards: [{ currency_id: 'coins', amount: 100 }] },
          { stars_required: 3, rewards: [{ currency_id: 'gems', amount: 10 }] },
        ],
      },
    ],
  },

  game: {
    gameLogic: {
      gameLogicConfig: {
        matchCount: undefined,
        countUndoTileRevive: undefined,
        countShuffleTileRevive: undefined,
        countSlotHolder: undefined,
        warningThreshold: undefined,
      },
      combo: {
        matchEffect: undefined,
        maxNoMatch: undefined,
      },
    },
    viewConfig: {
      gridView: {
        tileSize: { x: undefined, y: undefined },
      },
      holderView: {
        slotSize: { x: undefined, y: undefined },
        slotSpace: undefined,
        ratioBetweenTwoTile: undefined,
        slotYPadding: undefined,
        tileInHolderYPadding: undefined,
      },
    },
  },

  analytics: {
    enabled: true,
    providers: [],
    events: [],
  },

  ux: {
    theme: 'default',
    animations_enabled: true,
    haptic_feedback_enabled: true,
  },

  haptic: {
    soft: {
      android: { duration: 10, amplitude: 40 },
      ios: { intensity: 0.6, sharpness: 0, duration: 0.01 },
    },
    light: {
      android: { duration: 10, amplitude: 60 },
      ios: { intensity: 0.4, sharpness: 0.2, duration: 0.01 },
    },
    medium: {
      android: { duration: 20, amplitude: 120 },
      ios: { intensity: 0.6, sharpness: 0.4, duration: 0.02 },
    },
    heavy: {
      android: { duration: 30, amplitude: 200 },
      ios: { intensity: 0.8, sharpness: 0.6, duration: 0.03 },
    },
    button: {
      android: { duration: 10, amplitude: 80 },
      ios: { intensity: 0.5, sharpness: 0.3, duration: 0.01 },
    },
    success: {
      android: { duration: 50, amplitude: 100 },
      ios: { intensity: 0.7, sharpness: 0.5, duration: 0.05 },
    },
    error: {
      android: { duration: 100, amplitude: 150 },
      ios: { intensity: 0.9, sharpness: 0.8, duration: 0.1 },
    },
  },

  remove_ads: {
    enabled: true,
    minLevel: 5,
    adWatchedTrigger: 4,
    daysPlayedTrigger: 2,
    durationHours: 24,
    maxLifetimeShows: 4,
    maxSessionShows: 1,
    cooldownPopupHours: 24,
    cooldownOfferHours: 24,
  },

  tile_bundle: {
    enabled: true,
    discount: 80,
    minLevel: 20,
    daysPlayedTrigger: 2,
    sessionsPlayedTrigger: 1,
    durationHours: 24,
    maxLifetimeShows: 2,
    maxSessionShows: 1,
    cooldownPopupHours: 48,
    cooldownOfferHours: 48,
  },
};

/**
 * Get default template for a config type
 */
export function getDefaultTemplate(configType: ConfigType): any {
  return JSON.parse(JSON.stringify(configTemplates[configType]));
}

/**
 * Check if a config type has a template
 */
export function hasTemplate(configType: string): configType is ConfigType {
  return configType in configTemplates;
}


