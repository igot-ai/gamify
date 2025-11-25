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
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('firebase_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - clear token and redirect to login
            localStorage.removeItem('firebase_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
