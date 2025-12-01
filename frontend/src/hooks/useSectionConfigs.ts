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
 * Legacy hook for backward compatibility.
 * Use useSaveDraft instead.
 */
export function useUpdateSectionConfig(sectionConfigId: string) {
  const saveDraft = useSaveDraft();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['update-section-config', sectionConfigId],
    mutationFn: async (data: { config_data: any }) => {
      if (!sectionConfigId) {
        throw new Error('Section config ID is required');
      }
      const response = await apiClient.patch<ApiResponse<SectionConfig>>(
        `/section-configs/${sectionConfigId}`,
        { draft_data: data.config_data }
      );
      return response.data.data;
    },
    onSuccess: () => {
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

// ============================================
// DEPRECATED - Keep for backward compatibility
// ============================================

/**
 * @deprecated Use useSectionConfig instead
 * This function now returns an array with single item for backward compatibility
 */
export function useSectionConfigs(filters: SectionConfigFilters) {
  const query = useSectionConfig(filters);
  
  return {
    ...query,
    data: query.data ? [query.data] : [],
  };
}

/**
 * @deprecated Configs are now auto-created on first GET
 */
export function useCreateSectionConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      game_id: string;
      section_type: SectionType;
      config_data?: any;
    }) => {
      // Just fetch the config (auto-creates if doesn't exist)
      const params = new URLSearchParams();
      params.append('game_id', data.game_id);
      params.append('section_type', data.section_type);
      
      const response = await apiClient.get<ApiResponse<SectionConfig>>(
        `/section-configs?${params.toString()}`
      );
      
      // If config_data was provided, save it as draft
      if (data.config_data && response.data.data) {
        const saveResponse = await apiClient.patch<ApiResponse<SectionConfig>>(
          `/section-configs/${response.data.data.id}`,
          { draft_data: data.config_data }
        );
        return saveResponse.data.data;
      }
      
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section-config'] });
      queryClient.invalidateQueries({ queryKey: ['section-configs-summary'] });
    },
  });
}
