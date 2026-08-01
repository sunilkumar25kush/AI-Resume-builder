import { env } from "../../config/env.js";
import { AiError } from "./base.js";
import { extractJson } from "./json.js";
import { GeminiProvider } from "./providers/gemini.js";
import { OllamaProvider } from "./providers/ollama.js";

const instances = new Map();

/** Get (and memoize) the primary provider selected by AI_PROVIDER. */
export function getProvider() {
  const key = env.AI_PROVIDER;
  if (!instances.has(key)) {
    instances.set(key, key === "gemini" ? new GeminiProvider() : new OllamaProvider());
  }
  return instances.get(key);
}

/** Ordered provider chain for fallback: primary first, then alternatives that are configured. */
export function getProviderChain() {
  const chain = [getProvider()];
  if (env.AI_PROVIDER !== "gemini") {
    const gemini = new GeminiProvider();
    if (gemini.isConfigured()) chain.push(gemini);
  }
  return chain;
}

/**
 * Generate text with a fallback chain — tries each configured provider in
 * order and returns the first success. Throws the last error if all fail.
 */
export async function generateWithFallback(prompt, opts = {}) {
  const chain = getProviderChain();
  let lastError = null;
  for (const provider of chain) {
    try {
      return await provider.generate(prompt, opts);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new AiError("No AI provider available", "AI_UNAVAILABLE");
}

/** Generate a JSON value, parsing provider output robustly. */
export async function generateJson(prompt, opts = {}) {
  const text = await generateWithFallback(prompt, { ...opts, json: true });
  return extractJson(text);
}

/** Lightweight health check — asks the provider to confirm it is alive. */
export async function pingProvider() {
  const chain = getProviderChain();
  const started = Date.now();
  let lastError = null;

  for (const provider of chain) {
    try {
      const text = await provider.generate('Reply with exactly: {"ok":true}', {
        json: true,
        temperature: 0,
        timeoutMs: 30_000,
      });
      return {
        ok: true,
        provider: provider.name,
        model: provider.model,
        latencyMs: Date.now() - started,
        sample: text.slice(0, 80),
      };
    } catch (error) {
      lastError = error;
    }
  }

  return {
    ok: false,
    provider: env.AI_PROVIDER,
    model: getProvider().model,
    latencyMs: Date.now() - started,
    error: lastError?.message ?? "No AI provider available",
  };
}
