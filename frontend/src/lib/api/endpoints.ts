/**
 * API Service Functions
 * Type-safe API calls for all endpoints
 */

import { apiEndpoints } from '@/constants/api';
import { apiRequest, apiPost, apiPut, apiDelete } from './client';
import type { Game, Config, User, AuditLog } from '@/types/api';

// ============================================================================
// Games API
// ============================================================================

export const gamesApi = {
  list: () => apiRequest<Game[]>(apiEndpoints.games.list),
  
  detail: (id: string) => apiRequest<Game>(apiEndpoints.games.detail(id)),
  
  create: (data: Partial<Game>) => apiPost<Game>(apiEndpoints.games.create, data),
  
  update: (id: string, data: Partial<Game>) =>
    apiPut<Game>(apiEndpoints.games.update(id), data),
  
  delete: (id: string) => apiDelete(apiEndpoints.games.delete(id)),
};

// ============================================================================
// Configs API
// ============================================================================

export const configsApi = {
  list: (gameId?: string) =>
    apiRequest<Config[]>(apiEndpoints.configs.list(gameId)),
  
  detail: (id: string) => apiRequest<Config>(apiEndpoints.configs.detail(id)),
  
  create: (data: Partial<Config>) => apiPost<Config>(apiEndpoints.configs.create, data),
  
  update: (id: string, data: Partial<Config>) =>
    apiPut<Config>(apiEndpoints.configs.update(id), data),
  
  delete: (id: string) => apiDelete(apiEndpoints.configs.delete(id)),
  
  saveDraft: (id: string, data: Partial<Config>) =>
    apiPut<Config>(apiEndpoints.configs.draft(id), data),
  
  submit: (id: string) => apiPost(apiEndpoints.configs.submit(id)),
  
  approve: (id: string) => apiPost(apiEndpoints.configs.approve(id)),
  
  reject: (id: string, reason: string) =>
    apiPost(apiEndpoints.configs.reject(id), { reason }),
  
  deploy: (id: string) => apiPost(apiEndpoints.configs.deploy(id)),
  
  getHistory: (id: string) =>
    apiRequest<any[]>(apiEndpoints.configs.history(id)),
};

// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
  me: () => apiRequest<User>(apiEndpoints.auth.me),
  
  logout: () => apiPost(apiEndpoints.auth.logout),
};

// ============================================================================
// Users API
// ============================================================================

export const usersApi = {
  list: () => apiRequest<User[]>(apiEndpoints.users.list),
  
  detail: (id: string) => apiRequest<User>(apiEndpoints.users.detail(id)),
  
  create: (data: Partial<User>) => apiPost<User>(apiEndpoints.users.create, data),
  
  update: (id: string, data: Partial<User>) =>
    apiPut<User>(apiEndpoints.users.update(id), data),
  
  delete: (id: string) => apiDelete(apiEndpoints.users.delete(id)),
  
  invite: (email: string, role: string) =>
    apiPost(apiEndpoints.users.invite, { email, role }),
};

// ============================================================================
// Audit Logs API
// ============================================================================

export const auditApi = {
  list: () => apiRequest<AuditLog[]>(apiEndpoints.audit.list),
  
  detail: (id: string) => apiRequest<AuditLog>(apiEndpoints.audit.detail(id)),
};

// ============================================================================
// Health API
// ============================================================================

export const healthApi = {
  check: () => apiRequest(apiEndpoints.health),
};

