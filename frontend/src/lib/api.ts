import axios from 'axios';
import { toast } from 'sonner';

// Use relative path for production (nginx proxy) or full URL for development
// In production, nginx will proxy /api/* to backend
// In development, use full URL if NEXT_PUBLIC_API_URL is set, otherwise use relative path
const getApiBaseUrl = (): string => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // If NEXT_PUBLIC_API_URL is set and is a full URL (starts with http), use it (dev mode)
    if (envUrl && envUrl.startsWith('http')) {
        return envUrl;
    }
    
    // Otherwise use relative path (production mode with nginx proxy)
    // This allows nginx to handle routing /api/* to backend
    return '/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Token storage key
const TOKEN_STORAGE_KEY = 'auth_token';

// Helper functions for token management
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setToken = (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const removeToken = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add Authorization header
apiClient.interceptors.request.use(
    (config) => {
        // Add Authorization header if token exists
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // If sending FormData, remove Content-Type header so axios can set it
        // automatically with the correct multipart/form-data boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 and 403 errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.detail || error.message || 'An error occurred';

        // Handle 401 Unauthorized
        if (status === 401) {
            toast.error(errorMessage || 'Unauthorized. Please login again.');
            removeToken();
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
            if (currentPath !== '/login') {
                // Use window.location for a full page redirect to clear any stale state
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }
        // Handle 403 Forbidden
        else if (status === 403) {
            toast.error(errorMessage || 'Access forbidden. You do not have permission to perform this action.');
        }

        return Promise.reject(error);
    }
);
