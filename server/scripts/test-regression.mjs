import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.resolve(__dirname, "..");
const BASE = "http://127.0.0.1:5001/api";
const UPLOADS_BASE = "http://127.0.0.1:5001/uploads";

console.log("==================================================");
console.log("   AI Resume Builder — Regression Test Suite      ");
console.log("==================================================\n");

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    process.stdout.write(`  [TEST] ${name} ... `);
    await fn();
    console.log("✅ PASS");
    passed++;
  } catch (err) {
    console.log("❌ FAIL");
    console.error(`         Error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack.split("\n").slice(1, 4).join("\n"));
    }
    failed++;
  }
}

// -------------------------------------------------------------
// Test 1: Health Check
// -------------------------------------------------------------
await test("Server health endpoint is online & healthy", async () => {
  const res = await fetch(`${BASE}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data?.db, "connected");
});

// -------------------------------------------------------------
// Test 2: CRIT-1 — Missing or short JWT_SECRET must crash server on start
// -------------------------------------------------------------
await test("CRIT-1: Server crashes if JWT_SECRET is short (<32 chars) or missing", async () => {
  const result = spawnSync(
    process.execPath,
    ["-e", "import('./src/config/env.js')"],
    {
      cwd: SERVER_DIR,
      env: { ...process.env, JWT_SECRET: "short-secret" },
      encoding: "utf-8",
    }
  );
  assert.equal(result.status, 1, "Process should exit with code 1 for invalid JWT_SECRET");
  assert.match(
    result.stderr + result.stdout,
    /JWT_SECRET must be at least 32 characters/,
    "Error output must specify JWT_SECRET requirements"
  );
});

// -------------------------------------------------------------
// Test 3: CRIT-2 — forgotPassword does NOT return reset token in JSON response
// -------------------------------------------------------------
await test("CRIT-2: POST /api/auth/forgot-password never returns token in response", async () => {
  const email = `test-user-${Date.now()}@example.com`;
  const res = await fetch(`${BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data?.devResetToken, undefined, "devResetToken must NOT be present in response");
  assert.equal(json.data?.resetToken, undefined, "resetToken must NOT be present in response");
});

// -------------------------------------------------------------
// Setup authenticated user for protected tests
// -------------------------------------------------------------
const testUser = {
  name: "Regression Test User",
  email: `regression-${Date.now()}@test.com`,
  password: "Password123!",
};

let userCookie = "";
let authToken = "";

await test("Register new user successfully", async () => {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(testUser),
  });
  assert.equal(res.status, 201);
  const setCookies = res.headers.getSetCookie?.() || [];
  const tokenCookie = setCookies.find((c) => c.startsWith("token=")) || res.headers.get("set-cookie") || "";
  userCookie = tokenCookie.split(";")[0];
  const body = await res.json();
  assert.equal(body.success, true);
  assert.ok(body.data?.user?.email, "Expected user in response");
});

if (!userCookie) {
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: testUser.email, password: testUser.password }),
  });
  const setCookies = loginRes.headers.getSetCookie?.() || [];
  const tokenCookie = setCookies.find((c) => c.startsWith("token=")) || loginRes.headers.get("set-cookie") || "";
  userCookie = tokenCookie.split(";")[0];
  const loginData = await loginRes.json();
  authToken = loginData.data?.token || "";
}

const authHeaders = {
  cookie: userCookie,
  ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
};

// -------------------------------------------------------------
// Test 4: HIGH-4 — Account enumeration prevention on register
// -------------------------------------------------------------
await test("HIGH-4: Duplicate registration does NOT reveal account existence with 409", async () => {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(testUser),
  });
  // Must NOT be 409 Conflict with "already exists"
  assert.notEqual(res.status, 409, "Must not return 409 Conflict");
  const data = await res.json();
  assert.doesNotMatch(data.message || "", /already exists/i, "Message must not reveal user existence");
});

// -------------------------------------------------------------
// Test 5: HIGH-1 — Sensitive upload routes (/uploads/resumes, /uploads/jds) are auth-gated
// -------------------------------------------------------------
await test("HIGH-1: GET /uploads/resumes/* requires authentication (returns 401)", async () => {
  const res = await fetch(`${UPLOADS_BASE}/resumes/nonexistent.pdf`);
  assert.equal(res.status, 401, "Unauthenticated access to /uploads/resumes must return 401");
});

await test("HIGH-1: GET /uploads/jds/* requires authentication (returns 401)", async () => {
  const res = await fetch(`${UPLOADS_BASE}/jds/nonexistent.pdf`);
  assert.equal(res.status, 401, "Unauthenticated access to /uploads/jds must return 401");
});

await test("HIGH-1: GET /uploads/avatars/* is public (returns 404 for missing file, not 401)", async () => {
  const res = await fetch(`${UPLOADS_BASE}/avatars/nonexistent.png`);
  assert.equal(res.status, 404, "Public avatar endpoint should return 404 for nonexistent file");
});

// -------------------------------------------------------------
// Test 6: HIGH-2 — Magic-byte validation rejects fake PDF
// -------------------------------------------------------------
await test("HIGH-2: Uploading HTML disguised as application/pdf is rejected (magic-byte check)", async () => {
  const fakePdfContent = "<html><body><h1>Malicious content</h1></body></html>";
  const form = new FormData();
  form.append("resume", new Blob([fakePdfContent], { type: "application/pdf" }), "exploit.pdf");

  const res = await fetch(`${BASE}/resumes`, {
    method: "POST",
    headers: authHeaders,
    body: form,
  });

  assert.equal(res.status, 400, "Should reject disguised file with 400 Bad Request");
  const data = await res.json();
  assert.equal(data.success, false);
});

// -------------------------------------------------------------
// Test 7: HIGH-3 — AiError status code mapping
// -------------------------------------------------------------
await test("HIGH-3: AiError correctly maps error codes to HTTP status codes", async () => {
  const { AiError } = await import("../src/services/ai/base.js");
  const errRateLimit = new AiError("Rate limited", "AI_RATE_LIMIT");
  assert.equal(errRateLimit.statusCode, 429);

  const errTimeout = new AiError("Timeout", "AI_TIMEOUT");
  assert.equal(errTimeout.statusCode, 504);

  const errBadResp = new AiError("Bad JSON", "AI_BAD_RESPONSE");
  assert.equal(errBadResp.statusCode, 502);

  const errUnavailable = new AiError("Model offline", "AI_UNAVAILABLE");
  assert.equal(errUnavailable.statusCode, 503);
});

// -------------------------------------------------------------
// Test 8: CastError handling — invalid ID returns 400 instead of 500
// -------------------------------------------------------------
await test("CastError: Malformed ObjectId in URL parameter returns 400, not 500", async () => {
  const res = await fetch(`${BASE}/resumes/not-a-valid-object-id`, {
    headers: authHeaders,
  });
  assert.equal(res.status, 400, "Expected 400 for malformed ObjectId");
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.message, /invalid id/i);
});

// -------------------------------------------------------------
// Test 9: MED-1 — Pagination on listResumes, listJds, listOptimizations
// -------------------------------------------------------------
await test("MED-1: GET /api/resumes returns pagination metadata with resumes array", async () => {
  const res = await fetch(`${BASE}/resumes?page=1&limit=5`, {
    headers: authHeaders,
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data?.resumes), "Expected data.resumes array");
  assert.ok(json.data?.pagination, "Expected data.pagination object");
  assert.equal(json.data.pagination.page, 1);
  assert.equal(json.data.pagination.limit, 5);
  assert.equal(typeof json.data.pagination.total, "number");
  assert.equal(typeof json.data.pagination.pages, "number");
});

await test("MED-1: GET /api/jds returns pagination metadata with jds array", async () => {
  const res = await fetch(`${BASE}/jds?page=1&limit=10`, {
    headers: authHeaders,
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data?.jds), "Expected data.jds array");
  assert.ok(json.data?.pagination, "Expected data.pagination object");
  assert.equal(json.data.pagination.page, 1);
  assert.equal(json.data.pagination.limit, 10);
});

await test("MED-1: GET /api/optimizations returns pagination metadata with optimizations array", async () => {
  const res = await fetch(`${BASE}/optimizations?page=1&limit=10`, {
    headers: authHeaders,
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data?.optimizations), "Expected data.optimizations array");
  assert.ok(json.data?.pagination, "Expected data.pagination object");
});

// -------------------------------------------------------------
// Test 10: MED-3 — updateJd uses $set and preserves ownership
// -------------------------------------------------------------
let testJdId = "";
await test("Create a sample JD to test update", async () => {
  const res = await fetch(`${BASE}/jds`, {
    method: "POST",
    headers: { ...authHeaders, "content-type": "application/json" },
    body: JSON.stringify({
      text: "Senior Software Engineer at TestCorp\nRequirements:\n- 5 years Node.js\n- React, Docker\nResponsibilities:\n- Build microservices",
    }),
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  testJdId = data.data?.jd?._id;
  assert.ok(testJdId, "Expected created JD ID");
});

await test("MED-3: PATCH /api/jds/:id safely updates fields via $set and rejects user tampering", async () => {
  const res = await fetch(`${BASE}/jds/${testJdId}`, {
    method: "PATCH",
    headers: { ...authHeaders, "content-type": "application/json" },
    body: JSON.stringify({
      title: "Staff Software Engineer",
      company: "TestCorp Global",
      user: "64f1a2b3c4d5e6f7a8b9c0d1", // Attempt to tamper with user ownership
    }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data?.jd?.title, "Staff Software Engineer");
  assert.equal(data.data?.jd?.company, "TestCorp Global");
  // Ensure user ownership was not overwritten
  assert.notEqual(data.data?.jd?.user, "64f1a2b3c4d5e6f7a8b9c0d1");
});

// -------------------------------------------------------------
// Test 11: MED-4 — createFromFile error handling on unreadable file
// -------------------------------------------------------------
await test("MED-4: POST /api/jds with empty or unreadable file returns 400 Bad Request", async () => {
  const emptyTxt = "    \n   ";
  const form = new FormData();
  form.append("jd", new Blob([emptyTxt], { type: "text/plain" }), "empty.txt");

  const res = await fetch(`${BASE}/jds`, {
    method: "POST",
    headers: authHeaders,
    body: form,
  });
  assert.equal(res.status, 400, "Empty text file should be rejected with 400");
  const data = await res.json();
  assert.equal(data.success, false);
});

// -------------------------------------------------------------
// Test 12: Sparse index on User.passwordResetToken
// -------------------------------------------------------------
await test("Database: User model defines sparse index on passwordResetToken", async () => {
  const User = (await import("../src/models/User.js")).default;
  const pathConfig = User.schema.path("passwordResetToken");
  assert.ok(
    pathConfig._index?.sparse ||
    User.schema.indexes().some(([fields, opts]) => fields.passwordResetToken && opts?.sparse),
    "passwordResetToken should have a sparse index configured"
  );
});

// -------------------------------------------------------------
// Test 13: Canonical GET /api/users/me returns authenticated user
// -------------------------------------------------------------
await test("REST: GET /api/users/me returns authenticated user profile", async () => {
  const res = await fetch(`${BASE}/users/me`, {
    headers: authHeaders,
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data?.user?.email, testUser.email);
});

// -------------------------------------------------------------
// Test 14: Canonical GET /api/job-descriptions matches /api/jds
// -------------------------------------------------------------
await test("REST: GET /api/job-descriptions works with pagination and matches /api/jds", async () => {
  const resCanonical = await fetch(`${BASE}/job-descriptions?page=1&limit=5`, {
    headers: authHeaders,
  });
  assert.equal(resCanonical.status, 200);
  const jsonCanonical = await resCanonical.json();
  assert.equal(jsonCanonical.success, true);
  assert.ok(Array.isArray(jsonCanonical.data?.jds));

  const resAlias = await fetch(`${BASE}/jds?page=1&limit=5`, {
    headers: authHeaders,
  });
  assert.equal(resAlias.status, 200);
  const jsonAlias = await resAlias.json();
  assert.equal(jsonCanonical.data.pagination.total, jsonAlias.data.pagination.total);
});

// -------------------------------------------------------------
// Test 15: Canonical GET /api/resume-optimizations matches /api/optimizations
// -------------------------------------------------------------
await test("REST: GET /api/resume-optimizations works and matches /api/optimizations", async () => {
  const resCanonical = await fetch(`${BASE}/resume-optimizations?page=1&limit=5`, {
    headers: authHeaders,
  });
  assert.equal(resCanonical.status, 200);
  const jsonCanonical = await resCanonical.json();
  assert.equal(jsonCanonical.success, true);
  assert.ok(Array.isArray(jsonCanonical.data?.optimizations));

  const resAlias = await fetch(`${BASE}/optimizations?page=1&limit=5`, {
    headers: authHeaders,
  });
  assert.equal(resAlias.status, 200);
});

// -------------------------------------------------------------
// Test 16: Canonical POST /api/resumes/templates/blank creates a resume
// -------------------------------------------------------------
let testResumeId = "";
await test("REST: POST /api/resumes/templates/blank creates new resume", async () => {
  const res = await fetch(`${BASE}/resumes/templates/blank`, {
    method: "POST",
    headers: { ...authHeaders, "content-type": "application/json" },
    body: JSON.stringify({ template: "modern-clean" }),
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  testResumeId = data.data?.resume?._id;
  assert.ok(testResumeId, "Expected created resume ID");
});

// -------------------------------------------------------------
// Test 17: Canonical POST /api/ats-evaluations evaluates scorecard
// -------------------------------------------------------------
await test("REST: POST /api/ats-evaluations returns scorecard for resume", async () => {
  if (!testResumeId) return;
  const res = await fetch(`${BASE}/ats-evaluations`, {
    method: "POST",
    headers: { ...authHeaders, "content-type": "application/json" },
    body: JSON.stringify({ resumeId: testResumeId }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(typeof data.data?.atsScore, "number");
  assert.ok(Array.isArray(data.data?.checklist));
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log("\n==================================================");
console.log(`Regression Test Results: ${passed} passed, ${failed} failed`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
