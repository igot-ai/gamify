import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { 
  SectionConfig, 
  SectionType, 
  SectionConfigSummary, 
  SectionConfigVersion,
  SectionConfigVersionListResponse,
  SectionConfigVersionCreate,
  SectionConfigVersionUpdate,
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

      const response = await apiClient.get<SectionConfig>(
        `/section-configs?${params.toString()}`
      );
      return response.data;
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
      const response = await apiClient.get<SectionConfig>(
        `/section-configs/${sectionConfigId}`
      );
      return response.data;
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
      const response = await apiClient.get<SectionConfigSummary[]>(
        `/section-configs/summary?game_id=${gameId}`
      );
      return response.data || [];
    },
    enabled: !!gameId,
  });
}

/**
 * Fetch total configuration count across all games
 * Aggregates summaries from all accessible games
 */
export function useTotalConfigurationsCount(gameIds: string[]) {
  return useQuery({
    queryKey: ['total-configurations-count', gameIds.sort().join(',')],
    queryFn: async () => {
      if (!gameIds || gameIds.length === 0) {
        return 0;
      }

      // Fetch summaries for all games in parallel
      const summaryPromises = gameIds.map(async (gameId) => {
        try {
          const response = await apiClient.get<SectionConfigSummary[]>(
            `/section-configs/summary?game_id=${gameId}`
          );
          return response.data || [];
        } catch (error) {
          // If a game fails, return empty array
          console.error(`Failed to fetch configs for game ${gameId}:`, error);
          return [];
        }
      });

      const allSummaries = await Promise.all(summaryPromises);
      
      // Count configurations that have at least one version
      const totalCount = allSummaries.flat().filter(
        (summary) => summary.version_count > 0
      ).length;

      return totalCount;
    },
    enabled: gameIds.length > 0,
  });
}

/**
 * Fetch total configuration versions across all games
 * Aggregates version counts from all accessible games
 */
export function useTotalConfigurationVersions(gameIds: string[]) {
  return useQuery({
    queryKey: ['total-configuration-versions', gameIds.sort().join(',')],
    queryFn: async () => {
      if (!gameIds || gameIds.length === 0) {
        return 0;
      }

      // Fetch summaries for all games in parallel
      const summaryPromises = gameIds.map(async (gameId) => {
        try {
          const response = await apiClient.get<SectionConfigSummary[]>(
            `/section-configs/summary?game_id=${gameId}`
          );
          return response.data || [];
        } catch (error) {
          // If a game fails, return empty array
          console.error(`Failed to fetch configs for game ${gameId}:`, error);
          return [];
        }
      });

      const allSummaries = await Promise.all(summaryPromises);
      
      // Sum all version counts across all configurations
      const totalVersions = allSummaries.flat().reduce(
        (sum, summary) => sum + summary.version_count,
        0
      );

      return totalVersions;
    },
    enabled: gameIds.length > 0,
  });
}

// ==================== Version Management Hooks ====================

/**
 * Fetch all versions for a section config
 */
export function useSectionConfigVersions(sectionConfigId: string) {
  return useQuery({
    queryKey: ['section-config-versions', sectionConfigId],
    queryFn: async () => {
      const response = await apiClient.get<SectionConfigVersionListResponse>(
        `/section-configs/${sectionConfigId}/versions`
      );
      return response.data;
    },
    enabled: !!sectionConfigId,
  });
}

/**
 * Fetch a single version by ID
 */
export function useSectionConfigVersion(sectionConfigId: string, versionId: string) {
  return useQuery({
    queryKey: ['section-config-version', sectionConfigId, versionId],
    queryFn: async () => {
      const response = await apiClient.get<SectionConfigVersion>(
        `/section-configs/${sectionConfigId}/versions/${versionId}`
      );
      return response.data;
    },
    enabled: !!sectionConfigId && !!versionId,
  });
}

/**
 * Create a new version for a section config
 */
export function useCreateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sectionConfigId, 
      data 
    }: { 
      sectionConfigId: string; 
      data: SectionConfigVersionCreate;
    }) => {
      const response = await apiClient.post<SectionConfigVersion>(
        `/section-configs/${sectionConfigId}/versions`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['section-config-versions', variables.sectionConfigId] });
      queryClient.invalidateQueries({ queryKey: ['section-configs-summary'] });
    },
  });
}

/**
 * Update an existing version
 */
export function useUpdateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sectionConfigId,
      versionId, 
      data 
    }: { 
      sectionConfigId: string;
      versionId: string; 
      data: SectionConfigVersionUpdate;
    }) => {
      const response = await apiClient.patch<SectionConfigVersion>(
        `/section-configs/${sectionConfigId}/versions/${versionId}`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['section-config-versions', variables.sectionConfigId] });
      queryClient.invalidateQueries({ queryKey: ['section-config-version', variables.sectionConfigId, variables.versionId] });
      queryClient.invalidateQueries({ queryKey: ['section-configs-summary'] });
    },
  });
}

/**
 * Delete a version
 */
export function useDeleteVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sectionConfigId,
      versionId 
    }: { 
      sectionConfigId: string;
      versionId: string;
    }) => {
      await apiClient.delete(
        `/section-configs/${sectionConfigId}/versions/${versionId}`
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['section-config-versions', variables.sectionConfigId] });
      queryClient.invalidateQueries({ queryKey: ['section-configs-summary'] });
    },
  });
}

/**
 * Duplicate a version
 */
export function useDuplicateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sectionConfigId,
      versionId 
    }: { 
      sectionConfigId: string;
      versionId: string;
    }) => {
      const response = await apiClient.post<SectionConfigVersion>(
        `/section-configs/${sectionConfigId}/versions/${versionId}/duplicate`
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['section-config-versions', variables.sectionConfigId] });
      queryClient.invalidateQueries({ queryKey: ['section-configs-summary'] });
    },
  });
}
