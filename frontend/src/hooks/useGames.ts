import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { Game, ApiResponse } from '../types/api';

// Fetch all games
export function useGames() {
    return useQuery({
        queryKey: ['games'],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<Game[]>>('/games');
            // Backend now returns ApiResponse wrapper with data field
            return response.data.data;
        },
    });
}

// Fetch single game
export function useGame(gameId: string) {
    return useQuery({
        queryKey: ['games', gameId],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<Game>>(`/games/${gameId}`);
            // Backend now returns ApiResponse wrapper with data field
            return response.data.data;
        },
        enabled: !!gameId,
    });
}

// Create game with FormData (supports logo upload)
export function useCreateGame() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: FormData) => {
            // Don't set Content-Type header manually - axios will set it automatically
            // with the correct boundary for multipart/form-data
            const response = await apiClient.post<ApiResponse<Game>>('/games', data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
        },
    });
}

// Update game
export function useUpdateGame(gameId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<Game>) => {
            const response = await apiClient.patch<ApiResponse<Game>>(`/games/${gameId}`, data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
            queryClient.invalidateQueries({ queryKey: ['games', gameId] });
        },
    });
}

// Delete game
export function useDeleteGame() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (gameId: string) => {
            await apiClient.delete(`/games/${gameId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
        },
    });
}
