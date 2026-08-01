import axios from "axios";

import { API_BASE_URL } from "@/constants";

/** Shared axios instance — cookie-based auth, 401s handled centrally. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30_000,
});

/**
 * AI endpoints (Ollama analysis/generation) routinely take 60-120s+.
 * Use as per-request timeout override; the global 30s stays for everything else.
 */
export const AI_REQUEST_TIMEOUT = 180_000;

let unauthorizedHandler: (() => void) | null = null;

/** Auth store registers a callback here to react to expired sessions. */
export function setUnauthorizedHandler(fn: () => void) {
  unauthorizedHandler = fn;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) unauthorizedHandler?.();
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
