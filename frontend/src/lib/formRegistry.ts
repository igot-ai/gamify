import type { SectionType } from '@/types/api';
import type { ComponentType, RefObject } from 'react';

// Form components
import { EconomyConfigLayout } from '@/components/config/economy';
import { AdConfigForm } from '@/components/config/ads';
import { NotificationConfigForm } from '@/components/config/notification';
import { ShopConfigForm } from '@/components/config/ShopConfigForm';
import { GameConfigForm } from '@/components/config/forms/GameConfigForm';
import { HapticConfigForm } from '@/components/config/forms/HapticConfigForm';
import { RemoveAdsConfigForm } from '@/components/config/forms/RemoveAdsConfigForm';
import { TileBundleConfigForm } from '@/components/config/forms/TileBundleConfigForm';
import { BoosterConfigForm } from '@/components/config/forms/BoosterConfigForm';
import { RatingConfigForm } from '@/components/config/forms/RatingConfigForm';
import { LinkConfigForm } from '@/components/config/forms/LinkConfigForm';
import { ChapterRewardConfigForm } from '@/components/config/forms/ChapterRewardConfigForm';
import { GameEconomyConfigForm } from '@/components/config/forms/GameEconomyConfigForm';
import { ShopSettingsConfigForm } from '@/components/config/forms/ShopSettingsConfigForm';
import { SpinConfigForm } from '@/components/config/forms/SpinConfigForm';
import { HintOfferConfigForm } from '@/components/config/forms/HintOfferConfigForm';
import { TutorialConfigForm } from '@/components/config/tutorial';

// Simple form registry entry interface
export interface FormRegistryEntry {
  component: ComponentType<any>;
  getData: (ref: RefObject<any>) => any;
  reset: (ref: RefObject<any>, data: any) => void;
}

// Helper to create standard form entry
const createFormEntry = (component: ComponentType<any>): FormRegistryEntry => ({
  component,
  getData: (ref) => ref.current?.getData?.(),
  reset: (ref, data) => ref.current?.reset?.(data),
});

// Form registry - maps section types to their form components and methods
export const FORM_REGISTRY: Partial<Record<SectionType, FormRegistryEntry>> = {
  economy: createFormEntry(EconomyConfigLayout),
  ads: createFormEntry(AdConfigForm),
  notification: createFormEntry(NotificationConfigForm),
  shop: {
    component: ShopConfigForm,
    getData: () => null, // ShopConfigForm doesn't have getData
    reset: () => {}, // ShopConfigForm doesn't have reset
  },
  game: createFormEntry(GameConfigForm),
  haptic: createFormEntry(HapticConfigForm),
  remove_ads: createFormEntry(RemoveAdsConfigForm),
  tile_bundle: createFormEntry(TileBundleConfigForm),
  booster: createFormEntry(BoosterConfigForm),
  rating: createFormEntry(RatingConfigForm),
  link: createFormEntry(LinkConfigForm),
  chapter_reward: createFormEntry(ChapterRewardConfigForm),
  game_economy: createFormEntry(GameEconomyConfigForm),
  shop_settings: createFormEntry(ShopSettingsConfigForm),
  spin: createFormEntry(SpinConfigForm),
  hint_offer: createFormEntry(HintOfferConfigForm),
  tutorial: createFormEntry(TutorialConfigForm),
};

// Get form registry entry for a section type
export function getFormRegistry(sectionType: SectionType): FormRegistryEntry | null {
  return FORM_REGISTRY[sectionType] || null;
}

// Form ref types - using any for simplicity
export type FormRefs = {
  [key: string]: RefObject<any>;
};

