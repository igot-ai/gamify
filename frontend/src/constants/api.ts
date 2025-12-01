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

  // Section Configs
  sectionConfigs: {
    list: '/section-configs',
    detail: (id: string) => `/section-configs/${id}`,
    create: '/section-configs',
    update: (id: string) => `/section-configs/${id}`,
    delete: (id: string) => `/section-configs/${id}`,
    deploy: (id: string) => `/section-configs/${id}/deploy`,
    summary: '/section-configs/summary',
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
