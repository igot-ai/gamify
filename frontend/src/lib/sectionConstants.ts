import type { SectionType } from '@/types/api';

// Export transform functions
import { transformEconomyConfigToExport } from '@/lib/economyExportTransform';
import { transformAdConfigToExport } from '@/lib/adsExportTransform';
import { transformNotificationConfigToExport } from '@/lib/notificationExportTransform';
import { transformGameConfigToExport } from '@/lib/gameExportTransform';
import { transformHapticConfigToExport } from '@/lib/hapticExportTransform';
import { transformRemoveAdsConfigToExport } from '@/lib/removeAdsExportTransform';
import { transformTileBundleConfigToExport } from '@/lib/tileBundleExportTransform';
import { transformBoosterConfigToExport } from '@/lib/boosterExportTransform';
import { transformRatingConfigToExport } from '@/lib/ratingExportTransform';
import { transformLinkConfigToExport } from '@/lib/linkExportTransform';
import { transformChapterRewardConfigToExport } from '@/lib/chapterRewardExportTransform';
import { transformGameEconomyConfigToExport } from '@/lib/gameEconomyExportTransform';
import { transformShopSettingsConfigToExport } from '@/lib/shopSettingsExportTransform';
import { transformSpinConfigToExport } from '@/lib/spinExportTransform';
import { transformHintOfferConfigToExport } from '@/lib/hintOfferExportTransform';
import { transformTutorialConfigToExport } from '@/lib/tutorialExportTransform';

// Map URL path to section type
export const pathToSectionType: Record<string, SectionType> = {
  'economy': 'economy',
  'ads': 'ads',
  'notification': 'notification',
  'shop': 'shop',
  'booster': 'booster',
  'chapter-reward': 'chapter_reward',
  'game': 'game',
  'analytics': 'analytics',
  'ux': 'ux',
  'haptic': 'haptic',
  'remove-ads': 'remove_ads',
  'tile-bundle': 'tile_bundle',
  'rating': 'rating',
  'link': 'link',
  'game-economy': 'game_economy',
  'shop-settings': 'shop_settings',
  'spin': 'spin',
  'hint-offer': 'hint_offer',
  'tutorial': 'tutorial',
};

// Map section type to export transform function
export const sectionTransformMap: Partial<Record<SectionType, (data: any) => any>> = {
  'economy': transformEconomyConfigToExport,
  'ads': transformAdConfigToExport,
  'notification': transformNotificationConfigToExport,
  'booster': transformBoosterConfigToExport,
  'chapter_reward': transformChapterRewardConfigToExport,
  'game': transformGameConfigToExport,
  'haptic': transformHapticConfigToExport,
  'remove_ads': transformRemoveAdsConfigToExport,
  'tile_bundle': transformTileBundleConfigToExport,
  'rating': transformRatingConfigToExport,
  'link': transformLinkConfigToExport,
  'game_economy': transformGameEconomyConfigToExport,
  'shop_settings': transformShopSettingsConfigToExport,
  'spin': transformSpinConfigToExport,
  'hint_offer': transformHintOfferConfigToExport,
  'tutorial': transformTutorialConfigToExport,
};

// Map section type to export file name
export const sectionExportNameMap: Record<SectionType, string> = {
  'economy': 'economy-config',
  'ads': 'ads-config',
  'notification': 'notification-config',
  'shop': 'shop-config',
  'booster': 'booster-config',
  'chapter_reward': 'chapter-reward-config',
  'game': 'game-config',
  'analytics': 'analytics-config',
  'ux': 'ux-config',
  'haptic': 'haptic-config',
  'remove_ads': 'remove-ads-config',
  'tile_bundle': 'tile-bundle-config',
  'rating': 'rating-config',
  'link': 'link-config',
  'game_economy': 'game-economy-config',
  'shop_settings': 'shop-settings-config',
  'spin': 'spin-config',
  'hint_offer': 'hint-offer-config',
  'tutorial': 'tutorial-config',
};

