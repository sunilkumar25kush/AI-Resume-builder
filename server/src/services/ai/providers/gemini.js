import { env } from "../../../config/env.js";
import { AiError, AiProvider } from "../base.js";
import { withRetry } from "../retry.js";

/**
 * Gemini provider — Google Generative Language API over plain fetch
 * (no SDK dependency). JSON mode uses responseMimeType.
 */
export class GeminiProvider extends AiProvider {
  constructor() {
    super({ timeoutMs: 60_000 });
    this.apiKey = env.GEMINI_API_KEY;
    this.model = env.GEMINI_MODEL;
  }

  get name() {
    return "gemini";
  }

  /** @returns {boolean} True when an API key is configured. */
  isConfigured() {
    return Boolean(this.apiKey);
  }

  async generate(prompt, { json = false, temperature = 0.2, timeoutMs } = {}) {
    if (!this.isConfigured()) {
      throw new AiError("GEMINI_API_KEY is not configured", "AI_CONFIG");
    }

    return withRetry(
      async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs ?? this.timeoutMs);
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature,
                ...(json ? { responseMimeType: "application/json" } : {}),
              },
            }),
            signal: controller.signal,
          });

          if (!res.ok) {
            if (res.status >= 400 && res.status < 500) {
              throw new AiError(`Gemini refused the request (${res.status}) — check GEMINI_API_KEY`, "AI_CONFIG", {
                status: res.status,
              });
            }
            throw new Error(`Gemini responded with status ${res.status}`);
          }

          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof text !== "string") {
            throw new AiError("Gemini returned no content", "AI_BAD_RESPONSE");
          }
          return text;
        } catch (error) {
          if (error?.name === "AbortError") {
            throw new AiError("Gemini request timed out", "AI_TIMEOUT");
          }
          throw error;
        } finally {
          clearTimeout(timeout);
        }
      },
      { attempts: 2, timeoutMs: timeoutMs ?? this.timeoutMs },
    );
  }
}
