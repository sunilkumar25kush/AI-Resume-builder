import axios from "axios";

import { API_BASE_URL } from "@/constants";

/** Shared axios instance — cookie-based auth, 401s handled centrally. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30_000,
});

/**
 * AI endpoints (Gemini generation) routinely take 60-120s+.
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

/** Normalizes API error to a readable, actionable message for toasts/forms. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    // Offline check: user lost internet connectivity
    if (typeof navigator !== "undefined" && navigator && !navigator.onLine) {
      return "You appear to be offline. Please check your internet connection and try again.";
    }

    // Server-provided structured error message (e.g. { success: false, message: "..." })
    if (typeof data === "object" && data !== null && typeof (data as { message?: string }).message === "string") {
      const msg = (data as { message: string }).message.trim();
      if (msg) return msg;
    }

    // Server returned plain string that is not raw HTML
    if (typeof data === "string" && data.trim() && !data.trim().startsWith("<")) {
      return data.trim();
    }

    // User-friendly fallbacks for specific HTTP status codes
    switch (status) {
      case 401:
        return "Your session has expired. Please log in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource could not be found.";
      case 413:
        return "The uploaded file is too large.";
      case 429:
        return "Too many requests. Please wait a minute before trying again.";
      case 500:
        return "An internal server error occurred. Please try again.";
      case 502:
        return "The server is temporarily unavailable (502 Bad Gateway). Please try again in a few moments.";
      case 503:
        return "Service is temporarily unavailable (503). The server or database may be spinning up — please try again in a moment.";
      case 504:
        return "Request timed out waiting for the server (504). Please try again.";
      default:
        break;
    }

    // Network & connection failures
    if (error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout")) {
      return "The request timed out. AI generation can take longer during peak times — please try again.";
    }
    if (error.message === "Network Error") {
      return "Unable to connect to the server. Please verify your internet connection or check if the server is starting up.";
    }

    return error.message ?? "Something went wrong";
  }

  return error instanceof Error ? error.message : "Something went wrong";
}
