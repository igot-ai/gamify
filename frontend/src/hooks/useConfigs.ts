import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { GameConfig, ApiResponse } from '../types/api';

interface ConfigFilters {
    game_id?: string;
    environment_id?: string;
    status?: string;
}

interface ConfigListResponse {
    configs: GameConfig[];
    total: number;
}

// Fetch configs with filters
export function useConfigs(filters: ConfigFilters = {}) {
    return useQuery({
        queryKey: ['configs', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.game_id) params.append('game_id', filters.game_id);
            if (filters.environment_id) params.append('environment_id', filters.environment_id);
            if (filters.status) params.append('status', filters.status);

            const response = await apiClient.get<ApiResponse<ConfigListResponse>>(`/configs?${params.toString()}`);
            // Backend returns {configs: [], total: number} wrapped in ApiResponse
            return response.data.data?.configs || [];
        },
    });
}

// Fetch single config
export function useConfig(configId: string) {
    return useQuery({
        queryKey: ['configs', configId],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<GameConfig>>(`/configs/${configId}`);
            return response.data.data;
        },
        enabled: !!configId,
    });
}

// Create config
export function useCreateConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { 
            game_id: string; 
            environment_id?: string;
            configData?: {
                game_core_config?: any;
                economy_config?: any;
                ad_config?: any;
                notification_config?: any;
                booster_config?: any;
                chapter_reward_config?: any;
                shop_config?: any;
                analytics_config?: any;
                ux_config?: any;
            };
        }) => {
            // TODO: Get created_by from auth context when implemented
            const payload = {
                game_id: data.game_id,
                environment_id: data.environment_id,
                created_by: 'system', // Temporary until auth is implemented
                // Use provided config data or initialize empty config sections
                game_core_config: data.configData?.game_core_config ?? null,
                economy_config: data.configData?.economy_config ?? null,
                ad_config: data.configData?.ad_config ?? null,
                notification_config: data.configData?.notification_config ?? null,
                booster_config: data.configData?.booster_config ?? null,
                chapter_reward_config: data.configData?.chapter_reward_config ?? null,
                shop_config: data.configData?.shop_config ?? null,
                analytics_config: data.configData?.analytics_config ?? null,
                ux_config: data.configData?.ux_config ?? null,
            };
            const response = await apiClient.post<ApiResponse<GameConfig>>('/configs', payload);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['configs'] });
        },
    });
}

// Update config
export function useUpdateConfig(configId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<GameConfig>) => {
            // TODO: Get updated_by from auth context when implemented
            const payload = {
                ...data,
                updated_by: 'system', // Temporary until auth is implemented
            };
            const response = await apiClient.patch<ApiResponse<GameConfig>>(`/configs/${configId}`, payload);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['configs'] });
            queryClient.invalidateQueries({ queryKey: ['configs', configId] });
        },
    });
}

// Submit for review
export function useSubmitForReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (configId: string) => {
            const response = await apiClient.post<ApiResponse<GameConfig>>(`/configs/${configId}/submit-review`);
            return response.data.data;
        },
        onSuccess: (_, configId) => {
            queryClient.invalidateQueries({ queryKey: ['configs'] });
            queryClient.invalidateQueries({ queryKey: ['configs', configId] });
        },
    });
}

// Approve config
export function useApproveConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (configId: string) => {
            const response = await apiClient.post<ApiResponse<GameConfig>>(`/configs/${configId}/approve`);
            return response.data.data;
        },
        onSuccess: (_, configId) => {
            queryClient.invalidateQueries({ queryKey: ['configs'] });
            queryClient.invalidateQueries({ queryKey: ['configs', configId] });
        },
    });
}

// Deploy config
export function useDeployConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (configId: string) => {
            const response = await apiClient.post<ApiResponse<GameConfig>>(`/configs/${configId}/deploy`);
            return response.data.data;
        },
        onSuccess: (_, configId) => {
            queryClient.invalidateQueries({ queryKey: ['configs'] });
            queryClient.invalidateQueries({ queryKey: ['configs', configId] });
        },
    });
}
