/** Error type for AI provider failures — carries a stable machine code. */
export class AiError extends Error {
  /**
   * @param {string} message Human-readable failure description.
   * @param {"AI_UNAVAILABLE"|"AI_TIMEOUT"|"AI_BAD_RESPONSE"|"AI_CONFIG"} code
   * @param {object} [details] Extra context (provider, model, status).
   */
  constructor(message, code, details) {
    super(message);
    this.name = "AiError";
    this.code = code;
    this.details = details;
  }
}

/**
 * Base contract for every AI provider.
 * Subclasses set `this.name` and `this.model` in their constructor and
 * implement `generate(prompt, opts)`.
 */
export class AiProvider {
  constructor({ timeoutMs = 60_000 } = {}) {
    this.timeoutMs = timeoutMs;
  }

  /**
   * Send a prompt and return the raw model text.
   * @param {string} prompt
   * @param {{ json?: boolean, temperature?: number, timeoutMs?: number }} [opts]
   * @returns {Promise<string>}
   */
  async generate() {
    throw new Error("AiProvider subclasses must implement `generate`");
  }
}
