'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useGame } from './useGames';
import type { Game } from '../types/api';

/**
 * Hook for URL-based game selection
 * - Reads appId from URL search params (single source of truth)
 * - Uses React Query to fetch game data
 * - Provides setSelectedGame to update URL
 */
export function useSelectedGame() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get appId from URL - this is the single source of truth
  const appId = searchParams.get('appId');

  // Fetch game data using React Query
  const { data: selectedGame, isLoading } = useGame(appId || '');

  // Function to select a game (updates URL)
  const setSelectedGame = useCallback((game: Game | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (game) {
      params.set('appId', game.id);
    } else {
      params.delete('appId');
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname || '/';
    router.push(newUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  // Function to set game by ID only (for cases where we don't have the full object)
  const setSelectedGameById = useCallback((newGameId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newGameId) {
      params.set('appId', newGameId);
    } else {
      params.delete('appId');
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname || '/';
    router.push(newUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  return {
    selectedGame: selectedGame || null,
    selectedGameId: appId,
    setSelectedGame,
    setSelectedGameById,
    isLoading,
  };
}
