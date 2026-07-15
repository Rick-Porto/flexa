/**
 * Axios instance for API communication.
 * Auth is handled via Supabase JWT — the token is attached as
 * Authorization: Bearer <token> on every request.
 */

import axios, { type AxiosInstance, type AxiosError } from "axios";
import { supabase } from "../lib/supabase";
import type { ApiErrorResponse } from "../types/api";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: any) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.error || error.message || "Erro inesperado";

    if (status === 401) {
      // Let useAuth handle redirect
      return Promise.reject(new Error("Não autorizado"));
    }

    console.error(`API [${status}] ${error.config?.url}: ${message}`);
    return Promise.reject(new Error(message));
  }
);

export default api;
