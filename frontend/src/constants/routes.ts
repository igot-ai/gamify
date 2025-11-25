/**
 * Application Routes
 * Centralized route definitions for type-safe navigation
 */

export const routes = {
  // Public routes
  home: '/',
  login: '/login',
  register: '/register',
  
  // Protected routes - Dashboard
  dashboard: '/dashboard',
  
  // Games
  games: '/games',
  gameDetail: (gameId: string) => `/games/${gameId}`,
  gameSettings: (gameId: string) => `/games/${gameId}/settings`,
  
  // Configs
  configs: (gameId: string) => `/games/${gameId}/configs`,
  configDetail: (configId: string) => `/configs/${configId}`,
  configEdit: (configId: string) => `/configs/${configId}/edit`,
  configCreate: (gameId: string) => `/games/${gameId}/configs/new`,
  
  // Settings
  settings: '/settings',
  profile: '/settings/profile',
  preferences: '/settings/preferences',
  
  // Admin
  admin: '/admin',
  users: '/admin/users',
  audit: '/admin/audit-logs',
} as const;

/**
 * Get the base path for a route group
 */
export const getRouteGroup = (path: string): string => {
  const segment = path.split('/')[1];
  return segment || 'home';
};

/**
 * Check if a path is protected (requires authentication)
 */
export const isProtectedRoute = (path: string): boolean => {
  const publicRoutes = [routes.login, routes.register, routes.home];
  return !publicRoutes.includes(path as any);
};

