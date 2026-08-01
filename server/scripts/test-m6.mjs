// M6 tests — AI provider layer: JSON parsing, retry/timeout logic,
// and a live /api/ai/ping against the running server (Ollama).
import http from "node:http";

import { extractJson } from "../src/services/ai/json.js";
import { AiError } from "../src/services/ai/base.js";
import { withRetry } from "../src/services/ai/retry.js";

let passed = 0;
let failed = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "  \u2713" : "  \u2717"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (ok) passed += 1;
  else failed += 1;
}

// --- JSON extraction unit tests ---
const fenced = 'Sure! Here is the JSON:\n```json\n{"title":"Dev","skills":["a","b"]}\n```';
check("fenced json parsed", extractJson(fenced)?.skills?.[1] === "b", JSON.stringify(extractJson(fenced)));

const prose = '{"score":87,"notes":"Great resume"} That was my analysis.';
check("prose before/after json", extractJson(prose)?.score === 87);

const nested = '{"a":{"b":[1,{"c":"}"}]}}';
check("nested + brace in string", extractJson(nested)?.a?.b?.[1]?.c === "}");

const arrayTop = '["x","y"]';
check("top-level array", extractJson(arrayTop)?.length === 2);

let threw = false;
try {
  extractJson("this is not json at all");
} catch (error) {
  threw = error instanceof AiError && error.code === "AI_BAD_RESPONSE";
}
check("garbage throws AiError", threw);

// --- Retry / timeout against a local mock server ---
const mock = http.createServer((req, res) => {
  if (req.url === "/flaky") {
    mock.flakyCount = (mock.flakyCount ?? 0) + 1;
    if (mock.flakyCount < 3) {
      res.writeHead(500).end("boom");
      return;
    }
  }
  if (req.url === "/hang") return; // never respond
  res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ ok: true }));
});
await new Promise((resolve) => mock.listen(0, resolve));
const mockPort = mock.address().port;

const flakyText = await withRetry(
  async (attempt, signal) => {
    const res = await fetch(`http://127.0.0.1:${mockPort}/flaky`, { signal });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return (await res.json()).ok;
  },
  { attempts: 3 },
);
check("retry recovers after 2 failures", flakyText === true, `flaky hits: ${mock.flakyCount}`);

let timedOut = false;
try {
  await withRetry(
    async (_attempt, signal) => {
      const res = await fetch(`http://127.0.0.1:${mockPort}/hang`, { signal });
      return res.status;
    },
    { attempts: 1, timeoutMs: 500 },
  );
} catch (error) {
  timedOut = error instanceof AiError && error.code === "AI_TIMEOUT";
}
check("timeout maps to AI_TIMEOUT", timedOut);

mock.close();

// --- Live ping against the running server (Ollama) ---
const health = await fetch("http://localhost:5001/api/health");
const healthJson = await health.json();
check("health has ai.model", Boolean(healthJson.data?.ai?.model), healthJson.data?.ai?.model);

const ping = await fetch("http://localhost:5001/api/ai/ping");
const pingJson = await ping.json();
check("ping 200", ping.status === 200, `status ${ping.status}`);
check("ping ok:true", pingJson.data?.ok === true);
check("ping provider = ollama", pingJson.data?.provider === "ollama", pingJson.data?.provider);
check("ping model set", Boolean(pingJson.data?.model), pingJson.data?.model);
check("ping latency reported", typeof pingJson.data?.latencyMs === "number");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
