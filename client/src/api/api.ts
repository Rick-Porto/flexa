/**
 * Axios instance with interceptors for API communication
 * Handles:
 * - Base URL from environment
 * - Authorization header from localStorage (JWT Bearer token)
 * - Error handling and 401 unauthorized responses
 * - TODO: Verify whether API uses Bearer token in header or cookie-based auth (check AuthExtension.cs)
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '../types/api';

// Create axios instance with baseURL from environment
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true, // Include cookies in requests (if backend uses cookie-based auth)
});

/**
 * Request interceptor: Add Authorization header with JWT Bearer token
 * TODO: Verify whether backend expects Bearer token in Authorization header
 * or if it uses cookie-based auth (check flexa.Api\AuthExtension.cs)
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get JWT token from localStorage (stored by login endpoint)
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure Content-Type is set for requests
    if (!config.headers['Content-Type'] && config.data) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle errors and 401 unauthorized responses
 * Redirects to login on 401 (token expired or invalid)
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear stored token
      localStorage.removeItem('auth_token');
      
      // Redirect to login (adjust path based on your router)
      window.location.href = '/';
      
      return Promise.reject(new Error('Unauthorized. Redirecting to login...'));
    }

    // Handle other errors
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'An error occurred';

    console.error('API Error:', {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
    });

    return Promise.reject(error);
  }
);

export default api;
