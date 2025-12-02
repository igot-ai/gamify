import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { 
  SectionConfig, 
  SectionType, 
  SectionConfigSummary, 
  SectionConfigVersion,
  SectionConfigVersionListResponse,
  ApiResponse,
} from '../types/api';

interface SectionConfigFilters {
  game_id: string;
  section_type: SectionType;
}

/**
 * Fetch or create a single section config for a game+section combination.
 * Auto-creates if it doesn't exist.
 */
export function useSectionConfig(filters: SectionConfigFilters) {
  return useQuery({
    queryKey: ['section-config', filters.game_id, filters.section_type],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('game_id', filters.game_id);
      params.append('section_type', filters.section_type);

      const response = await apiClient.get<ApiResponse<SectionConfig>>(
        `/section-configs?${params.toString()}`
      );
      return response.data.data;
    },
    enabled: !!filters.game_id && !!filters.section_type,
  });
}

/**
 * Fetch section config by ID
 */
export function useSectionConfigById(sectionConfigId: string) {
  return useQuery({
    queryKey: ['section-config', sectionConfigId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SectionConfig>>(
        `/section-configs/${sectionConfigId}`
      );
      return response.data.data;
    },
    enabled: !!sectionConfigId,
  });
}

/**
 * Fetch section configs summary for a game
 */
export function useSectionConfigsSummary(gameId: string) {
  return useQuery({
    queryKey: ['section-configs-summary', gameId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SectionConfigSummary[]>>(
        `/section-configs/summary?game_id=${gameId}`
      );
      return response.data.data || [];
    },
    enabled: !!gameId,
  });
}

/**
 * Save draft data for a section config.
 * Always editable - updates draft_data and sets has_unpublished_changes=true.
 */
export function useSaveDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sectionConfigId, 
      draft_data 
    }: { 
      sectionConfigId: string; 
      draft_data: any;
    }) => {
      const response = await apiClient.patch<ApiResponse<SectionConfig>>(
        `/section-configs/${sectionConfigId}`,
        { draft_data }
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['section-config'] });
      queryClient.invalidateQueries({ queryKey: ['section-configs-summary'] });
    },
  });
}

/**
 * Publish section config to Firebase.
 * - Deploys draft_data to Firebase
 * - Copies draft_data to published_data  
 * - Creates version snapshot
 * - Sets has_unpublished_changes to false
 */
export function usePublishConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sectionConfigId, 
      description 
    }: { 
      sectionConfigId: string; 
      description?: string;
    }) => {
      const response = await apiClient.post<ApiResponse<SectionConfig>>(
        `/section-configs/${sectionConfigId}/publish`,
        description ? { description } : {}
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['section-config'] });
      queryClient.invalidateQueries({ queryKey: ['section-configs-summary'] });
      queryClient.invalidateQueries({ queryKey: ['section-config-versions'] });
    },
  });
}

/**
 * Fetch version history for a section config
 */
export function useSectionConfigVersions(sectionConfigId: string) {
  return useQuery({
    queryKey: ['section-config-versions', sectionConfigId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SectionConfigVersionListResponse>>(
        `/section-configs/${sectionConfigId}/versions`
      );
      return response.data.data;
    },
    enabled: !!sectionConfigId,
  });
}

/**
 * Rollback to a specific version.
 * Copies the version's config_data to draft_data.
 * User must then publish to deploy the rollback.
 */
export function useRollbackConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sectionConfigId, 
      version 
    }: { 
      sectionConfigId: string; 
      version: number;
    }) => {
      const response = await apiClient.post<ApiResponse<SectionConfig>>(
        `/section-configs/${sectionConfigId}/rollback/${version}`
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['section-config'] });
      queryClient.invalidateQueries({ queryKey: ['section-configs-summary'] });
      queryClient.invalidateQueries({ queryKey: ['section-config-versions'] });
    },
  });
}
