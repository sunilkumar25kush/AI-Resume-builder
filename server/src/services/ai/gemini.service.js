import { env } from "../../config/env.js";
import { AiError } from "./base.js";
import { extractJson } from "./json.js";
import { withRetry } from "./retry.js";
import {
  buildAssistPrompt,
  buildGenerationPrompt,
  buildJdOnlyPrompt,
  buildOptimizePrompt,
  buildSuggestPrompt,
} from "./prompts.js";

/**
 * THE single AI service of this application.
 *
 * Every AI feature (resume generation, JD-only generation, optimization,
 * suggestions, section assist, health ping) goes through this class and its
 * singleton `geminiService`. There is no provider switching and no local
 * model — Google Gemini serves everything via the Generative Language API
 * (plain fetch, no SDK).
 *
 * Error handling maps failures to stable AiError codes with actionable
 * messages:
 *   - missing/invalid API key   -> AI_CONFIG
 *   - rate limit (429)          -> AI_RATE_LIMIT
 *   - request timeout           -> AI_TIMEOUT
 *   - empty/unparsable response -> AI_BAD_RESPONSE
 *   - network failure           -> AI_NETWORK
 *   - other 5xx                 -> AI_API
 */
class GeminiService {
  constructor() {
    this.apiKey = env.GEMINI_API_KEY;
    this.model = env.GEMINI_MODEL;
    this.timeoutMs = 60_000;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  /**
   * Raw Gemini call with retry + timeout + error mapping.
   * @param {string} prompt
   * @param {{ json?: boolean, temperature?: number, timeoutMs?: number }} [opts]
   * @returns {Promise<string>} model text
   */
  async generate(prompt, { json = false, temperature = 0.2, timeoutMs } = {}) {
    if (!this.isConfigured()) {
      throw new AiError(
        "GEMINI_API_KEY is not configured — set it in server/.env (local) or the Render environment",
        "AI_CONFIG",
      );
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
            const body = await res.text().catch(() => "");
            if (res.status === 401 || res.status === 403) {
              throw new AiError(
                `Gemini rejected the API key (${res.status}) — check GEMINI_API_KEY in the environment`,
                "AI_CONFIG",
                { status: res.status },
              );
            }
            if (res.status === 429) {
              throw new AiError(
                "Gemini rate limit exceeded (429) — wait a minute and try again",
                "AI_RATE_LIMIT",
                { status: 429 },
              );
            }
            if (res.status >= 400 && res.status < 500) {
              throw new AiError(
                `Gemini refused the request (${res.status}): ${body.slice(0, 140)}`,
                "AI_CONFIG",
                { status: res.status },
              );
            }
            throw new AiError(`Gemini API failure (${res.status}) — try again`, "AI_API", { status: res.status });
          }

          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof text !== "string" || !text.trim()) {
            throw new AiError("Gemini returned an empty response — try again", "AI_BAD_RESPONSE");
          }
          return text;
        } catch (error) {
          if (error?.name === "AbortError") {
            throw new AiError(
              `Gemini request timed out after ${Math.round((timeoutMs ?? this.timeoutMs) / 1000)}s`,
              "AI_TIMEOUT",
            );
          }
          if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new AiError("Network error reaching Gemini — check connectivity", "AI_NETWORK");
          }
          throw error;
        } finally {
          clearTimeout(timeout);
        }
      },
      { attempts: 2, timeoutMs: timeoutMs ?? this.timeoutMs },
    );
  }

  /** Generate a JSON value, parsing provider output robustly. */
  async generateJson(prompt, opts = {}) {
    const text = await this.generate(prompt, { ...opts, json: true });
    return extractJson(text);
  }

  /** Lightweight health check — used by /api/ai/ping (dev only). */
  async ping() {
    const started = Date.now();
    try {
      const text = await this.generate('Reply with exactly: {"ok":true}', {
        json: true,
        temperature: 0,
        timeoutMs: 30_000,
      });
      return {
        ok: true,
        provider: "gemini",
        model: this.model,
        latencyMs: Date.now() - started,
        sample: text.slice(0, 80),
      };
    } catch (error) {
      return {
        ok: false,
        provider: "gemini",
        model: this.model,
        latencyMs: Date.now() - started,
        error: error.message,
      };
    }
  }

  // ------------------------------------------------------------------
  // Domain wrappers — every AI feature calls exactly one of these.
  // Prompts live in prompts.js; DB access + merge/normalize logic stays
  // in the calling domain service.
  // ------------------------------------------------------------------

  /** Rewrite an existing resume against a job description. */
  generateResume({ resume, jd }) {
    return this.generateJson(buildGenerationPrompt({ resume, jd }), {
      timeoutMs: 150_000,
      temperature: 0.3,
    });
  }

  /** Build a fresh resume from a JD alone (Workflow 1 — no existing resume). */
  analyzeJd({ jd, targetTitle, experienceLevel }) {
    return this.generateJson(buildJdOnlyPrompt({ jd, targetTitle, experienceLevel }), {
      timeoutMs: 150_000,
      temperature: 0.3,
    });
  }

  /** ATS optimization report for a resume + JD pair. */
  optimizeResume({ resume, jd }) {
    return this.generateJson(buildOptimizePrompt({ resume, jd }), {
      timeoutMs: 120_000,
      temperature: 0.2,
    });
  }

  /** Editor-time "what else should I add?" suggestions. */
  generateSuggestions({ resume, jd }) {
    return this.generateJson(buildSuggestPrompt({ resume, jd }), {
      timeoutMs: 150_000,
      temperature: 0.4,
    });
  }

  /** Single-section writing assist — returns raw model output (JSON or text). */
  async assistSection({ section, action, content }) {
    const prompt = buildAssistPrompt({ section, action, content });
    if (section === "summary") {
      return this.generate(prompt, { timeoutMs: 60_000, temperature: 0.6 });
    }
    return this.generateJson(prompt, { timeoutMs: 60_000, temperature: 0.5 });
  }
}

/** Singleton — import `geminiService` wherever AI is needed. */
export const geminiService = new GeminiService();
