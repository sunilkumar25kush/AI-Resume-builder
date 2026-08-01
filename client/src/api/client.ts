import axios from "axios";

import { API_BASE_URL, TOKEN_STORAGE_KEY } from "@/constants";

/** Shared axios instance — auth token attached, 401s handled centrally. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid/expired — drop it; auth store (M2) will redirect to login.
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    return Promise.reject(error);
  },
);

/** Normalizes API error to a readable message for toasts/forms. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? "Something went wrong";
  }
  return error instanceof Error ? error.message : "Something went wrong";
}
