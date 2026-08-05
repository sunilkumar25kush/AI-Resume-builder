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
  }
}
