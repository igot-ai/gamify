'use client';

/**
 * Game Selection Context
 * 
 * This module provides game selection functionality using URL-based state management.
 * The selected game ID is stored in URL search params (?gameId=xxx) for shareable links.
 * 
 * Usage:
 *   import { useGame } from '@/contexts/GameContext';
 *   const { selectedGame, selectedGameId, setSelectedGame, isLoading } = useGame();
 */

// Re-export the URL-based hook as the primary interface
// This maintains backward compatibility with existing imports
export { useSelectedGame as useGame } from '../hooks/useSelectedGame';

// GameProvider is no longer needed since we use URL params + React Query
// Keeping this as a pass-through for backward compatibility with app layout
export function GameProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import React from 'react';
