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
  name: string;
  description: string | null;
  slug: string;
  status: 'active' | 'inactive' | 'archived';
  firebase_project_id?: string;
  environments?: Environment[];
  created_at?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Config {
  id: string;
  game_id: string;
  environment_id?: string;
  version: number;
  status: 'draft' | 'in_review' | 'approved' | 'deployed';
  game_core_config?: any;
  economy_config?: any;
  ad_config?: any;
  notification_config?: any;
  booster_config?: any;
  chapter_reward_config?: any;
  shop_config?: any;
  analytics_config?: any;
  ux_config?: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  approved_by?: string;
  approved_at?: string;
  deployed_at?: string;
}

// Legacy interface for backwards compatibility
export interface ConfigData {
  economy?: EconomyConfig;
  ads?: AdConfig;
  notifications?: NotificationConfig;
  analytics?: AnalyticsConfig;
  haptics?: HapticsConfig;
  shop?: ShopConfig;
  [key: string]: any;
}

export interface EconomyConfig {
  enabled: boolean;
  currency: string;
  startingBalance: number;
  dailyReward: number;
  taxRate: number;
}

export interface AdConfig {
  enabled: boolean;
  network: string;
  frequency: number;
  blacklist?: string[];
}

export interface NotificationConfig {
  enabled: boolean;
  channels: string[];
  frequency: number;
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackingId?: string;
  events?: string[];
}

export interface HapticsConfig {
  enabled: boolean;
  patterns?: string[];
}

export interface ShopConfig {
  enabled: boolean;
  currency: string;
  items: ShopItem[];
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Environment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
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

// Config Status Types  
export type ConfigStatus = 'draft' | 'in_review' | 'approved' | 'deployed' | 'archived';

// Game Config Type (for legacy compatibility)
export type GameConfig = Config;
