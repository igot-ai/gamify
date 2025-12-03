import axios from 'axios';

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

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Enable credentials for cookie-based auth
    withCredentials: true,
});

// Request interceptor to handle FormData
apiClient.interceptors.request.use(
    (config) => {
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

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // If we get a 401, the user is not authenticated
        // Redirect to login page (but not if we're already on the login page)
        if (error.response?.status === 401) {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
            if (currentPath !== '/login') {
                // Use window.location for a full page redirect to clear any stale state
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);
