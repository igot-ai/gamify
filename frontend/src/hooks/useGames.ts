import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { Game } from '../types/api';

// Fetch all games
export function useGames() {
    return useQuery({
        queryKey: ['games'],
        queryFn: async () => {
            const response = await apiClient.get<Game[]>('/games');
            return response.data;
        },
    });
}

// Fetch single game by app_id (primary key)
export function useGame(appId: string) {
    return useQuery({
        queryKey: ['games', appId],
        queryFn: async () => {
            const response = await apiClient.get<Game>(`/games/${appId}`);
            return response.data;
        },
        enabled: !!appId,
    });
}

// Create game with FormData (supports logo upload)
export function useCreateGame() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: FormData) => {
            // Don't set Content-Type header manually - axios will set it automatically
            // with the correct boundary for multipart/form-data
            const response = await apiClient.post<Game>('/games', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
        },
    });
}

// Update game by app_id (primary key)
export function useUpdateGame(appId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<Game>) => {
            const response = await apiClient.patch<Game>(`/games/${appId}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
            queryClient.invalidateQueries({ queryKey: ['games', appId] });
        },
    });
}

// Delete game by app_id (primary key)
export function useDeleteGame() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (appId: string) => {
            await apiClient.delete(`/games/${appId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['games'] });
        },
    });
}
