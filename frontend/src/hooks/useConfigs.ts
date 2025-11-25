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
            return response.data.data.configs;
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
        mutationFn: async (data: Partial<GameConfig>) => {
            const response = await apiClient.post<ApiResponse<GameConfig>>('/configs', data);
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
            const response = await apiClient.patch<ApiResponse<GameConfig>>(`/configs/${configId}`, data);
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
