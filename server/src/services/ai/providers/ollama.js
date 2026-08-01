import { env } from "../../../config/env.js";
import { AiError, AiProvider } from "../base.js";
import { withRetry } from "../retry.js";

const ENDPOINT = (url, path) => `${url.replace(/\/$/, "")}${path}`;

/** Ollama provider — talks to the local Ollama server via its HTTP API. */
export class OllamaProvider extends AiProvider {
  constructor() {
    super({ timeoutMs: env.OLLAMA_TIMEOUT_MS ?? 60_000 });
    this.baseUrl = env.OLLAMA_URL;
    this.model = env.OLLAMA_MODEL;
  }

  get name() {
    return "ollama";
  }

  async generate(prompt, { json = false, temperature = 0.2, timeoutMs } = {}) {
    return withRetry(
      async (_attempt, signal) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs ?? this.timeoutMs);
        try {
          const res = await fetch(ENDPOINT(this.baseUrl, "/api/generate"), {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              model: this.model,
              prompt,
              stream: false,
              format: json ? "json" : undefined,
              options: { temperature },
            }),
            signal,
          });

          if (!res.ok) {
            if (res.status >= 400 && res.status < 500) {
              throw new AiError(
                `Ollama refused the request (${res.status}) — check OLLAMA_MODEL is installed`,
                "AI_CONFIG",
                { status: res.status, model: this.model },
              );
            }
            throw new Error(`Ollama responded with status ${res.status}`);
          }

          const data = await res.json();
          if (typeof data?.response !== "string") {
            throw new AiError("Ollama returned an unexpected payload", "AI_BAD_RESPONSE");
          }
          return data.response;
        } catch (error) {
          if (error?.name === "AbortError") {
            throw new AiError("Ollama request timed out", "AI_TIMEOUT");
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
