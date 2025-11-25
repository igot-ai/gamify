/**
 * API Endpoints
 * Centralized API endpoint definitions
 */

export const apiEndpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },

  // Games
  games: {
    list: '/games',
    detail: (id: string) => `/games/${id}`,
    create: '/games',
    update: (id: string) => `/games/${id}`,
    delete: (id: string) => `/games/${id}`,
  },

  // Configs
  configs: {
    list: (gameId?: string) => (gameId ? `/games/${gameId}/configs` : '/configs'),
    detail: (id: string) => `/configs/${id}`,
    create: '/configs',
    update: (id: string) => `/configs/${id}`,
    delete: (id: string) => `/configs/${id}`,
    draft: (id: string) => `/configs/${id}/draft`,
    submit: (id: string) => `/configs/${id}/submit-review`,
    approve: (id: string) => `/configs/${id}/approve`,
    reject: (id: string) => `/configs/${id}/reject`,
    deploy: (id: string) => `/configs/${id}/deploy`,
    history: (id: string) => `/configs/${id}/history`,
  },

  // Environments
  environments: {
    list: '/environments',
    detail: (id: string) => `/environments/${id}`,
    create: '/environments',
    update: (id: string) => `/environments/${id}`,
    delete: (id: string) => `/environments/${id}`,
  },

  // Users
  users: {
    list: '/users',
    detail: (id: string) => `/users/${id}`,
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    invite: '/users/invite',
  },

  // Audit Logs
  audit: {
    list: '/audit-logs',
    detail: (id: string) => `/audit-logs/${id}`,
  },

  // Health
  health: '/health',
} as const;

/**
 * HTTP Methods
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * HTTP Status Codes
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

