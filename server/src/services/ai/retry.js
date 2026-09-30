import { AiError } from "./base.js";

/**
 * Wrap an async call with a timeout + limited retries.
 * Retries only on transient failures (network errors, 5xx). 4xx responses
 * are config/input problems — fail fast.
 *
 * @param {(attempt: number) => Promise<any>} fn Called once per attempt.
 * @param {{ attempts?: number, delayMs?: number, timeoutMs?: number }} [opts]
 * @returns {Promise<any>}
 */
export async function withRetry(fn, { attempts = 2, delayMs = 600, timeoutMs = 45_000, totalTimeoutMs = 80_000 } = {}) {
  const deadline = Date.now() + totalTimeoutMs;
  let lastError = null;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const remainingTime = deadline - Date.now();
    if (remainingTime <= 5000) {
      break; // Not enough time to attempt without breaching Render's proxy timeout
    }

    if (attempt > 0) {
      const waitTime = Math.min(delayMs * attempt, remainingTime - 1000);
      if (waitTime > 0) await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    const currentTimeout = Math.min(timeoutMs, Math.max(1000, deadline - Date.now()));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), currentTimeout);
    try {
      return await fn(attempt, controller.signal);
    } catch (error) {
      lastError = error;
      if (error instanceof AiError && (error.code === "AI_CONFIG" || error.code === "AI_BAD_RESPONSE")) {
        throw error; // Not transient.
      }
      if (error?.name === "AbortError" || error?.code === "AI_TIMEOUT") {
        lastError = new AiError("AI request timed out", "AI_TIMEOUT");
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError instanceof AiError
    ? lastError
    : new AiError(lastError?.message ?? "AI request failed", "AI_UNAVAILABLE", { cause: lastError });
}
