/**
 * Configuration Constants
 * App-wide configuration constants
 */

export const configConstants = {
  // Pagination
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
    pageSizes: [10, 20, 50, 100],
  },

  // Timeouts (in milliseconds)
  timeout: {
    api: 30000,
    debounce: 300,
    debounceSearch: 500,
    connection: 5000,
  },

  // Cache
  cache: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  },

  // File upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    allowedTypes: ['image/png', 'image/jpeg', 'application/json'],
  },

  // Form
  form: {
    debounceDelay: 500,
    validationDelay: 300,
  },

  // Theme
  theme: {
    colors: {
      primary: '#8B5CF6',
      accent: '#3B82F6',
      background: '#0A0E1A',
      foreground: '#E2E8F0',
    },
    modes: ['light', 'dark', 'system'] as const,
  },

  // Animation
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Validation
  validation: {
    passwordMinLength: 8,
    emailPattern:
      /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i,
  },

  // Status
  status: {
    draft: 'draft',
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    deployed: 'deployed',
  },

  // Sorting
  sort: {
    ascending: 'asc',
    descending: 'desc',
  },
} as const;

// Export types
export type SortDirection = (typeof configConstants.sort)[keyof typeof configConstants.sort];
export type ConfigStatus = (typeof configConstants.status)[keyof typeof configConstants.status];

