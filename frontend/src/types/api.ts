// API Response Types (matching backend)
export interface ApiResponse<T> {
    data: T;
    meta: {
        timestamp: string;
    };
}

export interface ApiError {
    error: {
        code: string;
        message: string;
        details?: Array<{
            field: string;
            message: string;
        }>;
    };
}

// Game Types
export interface Game {
    id: string;
    name: string;
    description?: string;
    firebase_project_id: string;
    created_at: string;
    updated_at: string;
    environments?: Environment[];
}

export interface Environment {
    id: string;
    game_id: string;
    name: 'development' | 'staging' | 'production';
    firebase_config?: Record<string, any>;
    created_at: string;
}

// Config Types
export type ConfigStatus = 'draft' | 'in_review' | 'approved' | 'deployed' | 'archived';

export interface GameConfig {
    id: string;
    game_id: string;
    environment_id: string;
    version: number;
    status: ConfigStatus;

    // Configuration sections
    game_config?: Record<string, any>;
    economy_config?: EconomyConfig;
    ad_config?: AdConfig;
    notification_config?: Record<string, any>;
    analytics_config?: Record<string, any>;
    ux_config?: Record<string, any>;

    // Metadata
    created_by: string;
    created_at: string;
    updated_by?: string;
    updated_at: string;
    reviewed_by?: string;
    approved_by?: string;
    deployed_at?: string;
}

// Economy Config
export interface EconomyConfig {
    currencies?: Currency[];
    iap_products?: IAPProduct[];
    rewards?: Reward[];
    shop_bundles?: ShopBundle[];
}

export interface Currency {
    id: string;
    name: string;
    display_name: string;
    icon?: string;
    initial_amount: number;
    max_amount?: number;
}

export interface IAPProduct {
    id: string;
    sku: string;
    name: string;
    description: string;
    price_usd: number;
    currency_rewards: Record<string, number>;
}

export interface Reward {
    id: string;
    name: string;
    type: string;
    amount: number;
}

export interface ShopBundle {
    id: string;
    name: string;
    description: string;
    price: number;
    items: Array<{
        type: string;
        id: string;
        quantity: number;
    }>;
}

// Ad Config
export interface AdConfig {
    networks?: AdNetwork[];
    placements?: AdPlacement[];
    frequency_caps?: FrequencyCap[];
}

export interface AdNetwork {
    id: string;
    name: string;
    priority: number;
    enabled: boolean;
}

export interface AdPlacement {
    id: string;
    name: string;
    type: 'interstitial' | 'rewarded' | 'banner';
    enabled: boolean;
}

export interface FrequencyCap {
    placement_id: string;
    max_impressions: number;
    time_window_seconds: number;
}

// Experiment Types (Phase 2)
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed';

export interface Experiment {
    id: string;
    game_id: string;
    name: string;
    hypothesis: string;
    status: ExperimentStatus;
    variants: ExperimentVariant[];
    targeting: Record<string, any>;
    schedule: Record<string, any>;
    metrics: Record<string, any>;
    created_by: string;
    created_at: string;
}

export interface ExperimentVariant {
    id: string;
    name: string;
    description: string;
    traffic_percent: number;
    config_overrides: Record<string, any>;
}
