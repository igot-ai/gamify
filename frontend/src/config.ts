import { env } from './env';

export const config = {
  // App
  name: env.NEXT_PUBLIC_APP_NAME,
  url: env.NEXT_PUBLIC_APP_URL,
  
  // API
  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
  },
  
  // Firebase
  firebase: {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  
  // Theme
  theme: {
    defaultTheme: 'system' as const,
    storageKey: 'gamify-theme',
  },
  
  // Query
  query: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  },
  
  // Auth
  auth: {
    tokenKey: 'firebase_token',
    sessionKey: 'gamify_session',
  },
} as const;

export type Config = typeof config;

