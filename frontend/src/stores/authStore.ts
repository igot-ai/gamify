import { create } from 'zustand';
import axios from 'axios';
import { apiClient, setToken, removeToken } from '@/lib/api';

export type UserRole = 'admin' | 'game_operator';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assigned_game_ids: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Login and get token
      const loginResponse = await apiClient.post<{ access_token: string }>('/auth/login', { email, password });
      
      // Extract token from response and save to localStorage
      const token = loginResponse.data.access_token;
      if (token) {
        setToken(token);
      }
      
      // Fetch current user info
      const response = await apiClient.get<User>('/auth/me');
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      removeToken();
      
      // Extract specific error message from different error formats
      let errorMessage = 'Login failed. Please try again.';
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;
        
        // Handle validation errors (422)
        if (status === 422) {
          // FastAPI validation errors can be in different formats
          if (Array.isArray(responseData?.detail)) {
            // Multiple validation errors
            const validationErrors = responseData.detail
              .map((err: { msg?: string; loc?: unknown[]; type?: string }) => {
                const field = Array.isArray(err.loc) && err.loc.length > 1 
                  ? err.loc[err.loc.length - 1] 
                  : 'field';
                return err.msg || `${field} is invalid`;
              })
              .join(', ');
            errorMessage = `Validation error: ${validationErrors}`;
          } else if (typeof responseData?.detail === 'string') {
            // Single validation error message
            errorMessage = responseData.detail;
          } else if (responseData?.detail) {
            // Object with error details
            errorMessage = typeof responseData.detail === 'object' 
              ? JSON.stringify(responseData.detail)
              : String(responseData.detail);
          } else {
            errorMessage = 'Invalid email or password format. Please check your input.';
          }
        }
        // Handle unauthorized (401)
        else if (status === 401) {
          errorMessage = responseData?.detail || 'Invalid email or password. Please try again.';
        }
        // Handle not found (404)
        else if (status === 404) {
          errorMessage = 'Login endpoint not found. Please contact support.';
        }
        // Handle server errors (500+)
        else if (status && status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        // Handle other errors with detail message
        else if (responseData?.detail) {
          errorMessage = typeof responseData.detail === 'string' 
            ? responseData.detail 
            : 'An error occurred during login.';
        }
        // Handle network errors
        else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        }
        else if (error.code === 'ERR_NETWORK' || !error.response) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout errors - we'll clear state anyway
    } finally {
      removeToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get<User>('/auth/me');
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch {
      removeToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
  
  clearError: () => set({ error: null }),
}));

// Selector hooks for convenience
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'admin');
export const useAssignedGameIds = () => useAuthStore((state) => state.user?.assigned_game_ids ?? []);
