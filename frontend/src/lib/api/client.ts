import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from '@/config';
import { HttpStatusCode } from '@/constants/api';

/**
 * Create and configure axios instance
 */
export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.api.baseUrl,
    timeout: config.api.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (cfg) => {
      // Add authorization token if available
      const token = typeof window !== 'undefined' ? localStorage.getItem(config.auth.tokenKey) : null;
      if (token) {
        cfg.headers.Authorization = `Bearer ${token}`;
      }
      return cfg;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Handle unauthorized
      if (error.response?.status === HttpStatusCode.UNAUTHORIZED) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(config.auth.tokenKey);
          // Trigger logout (handled by AuthContext)
          window.dispatchEvent(new Event('auth:logout'));
        }
      }

      // Log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();

/**
 * Generic API request function
 */
export async function apiRequest<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

/**
 * Generic API post function
 */
export async function apiPost<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

/**
 * Generic API put function
 */
export async function apiPut<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

/**
 * Generic API patch function
 */
export async function apiPatch<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

/**
 * Generic API delete function
 */
export async function apiDelete<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

