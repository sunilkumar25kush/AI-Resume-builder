/** Error type for AI failures — carries a stable machine code. */
export class AiError extends Error {
  /**
   * @param {string} message Human-readable failure description.
   * @param {"AI_UNAVAILABLE"|"AI_TIMEOUT"|"AI_BAD_RESPONSE"|"AI_CONFIG"|"AI_RATE_LIMIT"|"AI_NETWORK"|"AI_API"} code
   * @param {object} [details] Extra context (provider, model, status).
   */
  constructor(message, code, details) {
    super(message);
    this.name = "AiError";
    this.code = code;
    this.details = details;
    // Map AI error codes to appropriate HTTP status codes so the global
    // errorHandler returns the right status and avoids false-positive 500 logs.
    const STATUS_MAP = {
      AI_RATE_LIMIT: 429,
      AI_TIMEOUT: 504,
      AI_CONFIG: 503,
      AI_NETWORK: 503,
      AI_BAD_RESPONSE: 502,
      AI_API: 502,
      AI_UNAVAILABLE: 503,
    };
    this.statusCode = STATUS_MAP[code] ?? 500;
  }
}
