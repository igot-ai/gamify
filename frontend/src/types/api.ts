/**
 * API Response Types
 * Comprehensive type definitions for API responses
 */

export interface Game {
  app_id: string;  // Primary key - User-defined App ID
  name: string;
  description: string | null;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Section Config Types
export type SectionType = 
  | 'economy' 
  | 'ads' 
  | 'notification' 
  | 'shop' 
  | 'booster' 
  | 'chapter_reward' 
  | 'game' 
  | 'analytics' 
  | 'ux'
  | 'haptic'
  | 'remove_ads'
  | 'tile_bundle'
  | 'rating'
  | 'link'
  | 'game_economy'
  | 'shop_settings'
  | 'spin'
  | 'hint_offer'
  | 'tutorial';

/**
 * Section configuration - container for versions.
 * One record per game+section_type combination.
 */
export interface SectionConfig {
  id: string;
  game_id: string;
  section_type: SectionType;
  created_at: string;
  updated_at: string;
}

/**
 * Version (config container) - editable configuration snapshot.
 */
export interface SectionConfigVersion {
  id: string;
  section_config_id: string;
  title: string | null;
  description: string | null;
  experiment: string | null;
  variant: string | null;
  config_data: any | null;
  created_at: string;
  updated_at: string;
}

/**
 * Request payload for creating a new version.
 */
export interface SectionConfigVersionCreate {
  title?: string;
  description?: string;
  experiment?: string;
  variant?: string;
  config_data?: any;
}

/**
 * Request payload for updating a version.
 */
export interface SectionConfigVersionUpdate {
  title?: string;
  description?: string;
  experiment?: string;
  variant?: string;
  config_data?: any;
}

/**
 * Response for version list.
 */
export interface SectionConfigVersionListResponse {
  versions: SectionConfigVersion[];
  total: number;
}

/**
 * Summary of a section config for dashboard views.
 */
export interface SectionConfigSummary {
  section_type: SectionType;
  version_count: number;
  updated_at: string | null;
}

// Section metadata for UI display
export const SECTION_METADATA: Record<SectionType, { label: string; icon: string; description: string }> = {
  economy: { label: 'Economy', icon: '💰', description: 'Currencies, IAP packages, rewards' },
  ads: { label: 'Ads', icon: '📺', description: 'Ad networks and placements' },
  notification: { label: 'Notifications', icon: '🔔', description: 'Push and local notifications' },
  shop: { label: 'Shop', icon: '🛒', description: 'Shop items and bundles' },
  booster: { label: 'Boosters', icon: '🚀', description: 'Power-ups and boosters' },
  chapter_reward: { label: 'Chapter Rewards', icon: '🏆', description: 'Level progression rewards' },
  game: { label: 'Game Config', icon: '🎮', description: 'Game logic and view configuration' },
  analytics: { label: 'Analytics', icon: '📊', description: 'Analytics configuration' },
  ux: { label: 'UX', icon: '✨', description: 'User experience settings' },
  haptic: { label: 'Haptic', icon: '📳', description: 'Haptic feedback configuration' },
  remove_ads: { label: 'Remove Ads', icon: '🚫', description: 'Remove ads offer settings' },
  tile_bundle: { label: 'Tile Bundle', icon: '🎁', description: 'Tile bundle offer settings' },
  rating: { label: 'Rating', icon: '⭐', description: 'In-app rating prompt settings' },
  link: { label: 'Links', icon: '🔗', description: 'Privacy and terms links' },
  game_economy: { label: 'Game Economy', icon: '💵', description: 'Coin costs and rewards configuration' },
  shop_settings: { label: 'Shop Settings', icon: '⚙️', description: 'Shop enable and restore settings' },
  spin: { label: 'Spin Wheel', icon: '🎰', description: 'Spin wheel rewards and settings' },
  hint_offer: { label: 'Hint Offer', icon: '💡', description: 'Hint offer popup settings' },
  tutorial: { label: 'Tutorial', icon: '📚', description: 'Tutorial levels and step configurations' },
};
