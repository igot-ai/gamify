/**
 * API Response Types
 * Comprehensive type definitions for API responses
 */

export interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'viewer' | 'editor' | 'approver' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  app_id: string;  // User-defined App ID
  name: string;
  description: string | null;
  status: 'active' | 'inactive' | 'archived';
  firebase_project_id?: string;
  avatar_url?: string | null;
  created_at?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
 * Section configuration with draft and published data.
 * One record per game+section_type combination.
 */
export interface SectionConfig {
  id: string;
  game_id: string;
  section_type: SectionType;
  
  // Draft state (always editable)
  draft_data: any | null;
  draft_updated_at: string | null;
  draft_updated_by: string | null;
  
  // Published state (null if never published)
  published_data: any | null;
  published_version: number | null;
  published_at: string | null;
  published_by: string | null;
  
  // Dirty flag - indicates if draft has changes not yet published
  has_unpublished_changes: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Version history item - created on each publish.
 */
export interface SectionConfigVersion {
  id: string;
  version: number;
  config_data: any | null;
  published_at: string;
  published_by: string;
  description: string | null;
  created_at: string;
}

/**
 * Response for version history list.
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
  published_version: number | null;
  has_unpublished_changes: boolean;
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
