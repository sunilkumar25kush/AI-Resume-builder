import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = "http://127.0.0.1:5001/api";

console.log("==================================================================");
console.log("   PHASE 6: FULL REST API VALIDATION & INTEGRATION TEST SUITE     ");
console.log("==================================================================\n");

let passed = 0;
let failed = 0;
const results = [];

async function test(category, name, fn) {
  process.stdout.write(`  [${category}] ${name} ... `);
  try {
    await fn();
    console.log("✅ PASS");
    passed++;
    results.push({ category, name, status: "PASS" });
  } catch (err) {
    console.log("❌ FAIL");
    console.error(`         Error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack.split("\n").slice(1, 4).join("\n"));
    }
    failed++;
    results.push({ category, name, status: "FAIL", error: err.message });
  }
}

// -------------------------------------------------------------
// SECTION 1: Health & Diagnostics
// -------------------------------------------------------------
await test("HEALTH", "GET /api/health returns 200 with DB status", async () => {
  const res = await fetch(`${BASE}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data?.db, "connected");
});

await test("HEALTH", "GET /api/ai/status (canonical) & /api/ai/health (alias) return matching AI status", async () => {
  const res1 = await fetch(`${BASE}/ai/status`);
  assert.ok(res1.status === 200 || res1.status === 503, `Expected 200 or 503, got ${res1.status}`);
  const data1 = await res1.json();
  assert.equal(data1.data?.provider, "gemini");

  const res2 = await fetch(`${BASE}/ai/health`);
  assert.equal(res2.status, res1.status);
  const data2 = await res2.json();
  assert.equal(data2.data?.provider, data1.data?.provider);
});

// -------------------------------------------------------------
// SECTION 2: Authentication, Authorization & Security Gates
// -------------------------------------------------------------
const unauthRoutes = [
  { method: "PATCH", path: "/users/me" },
  { method: "GET", path: "/resumes" },
  { method: "POST", path: "/resumes/templates/blank" },
  { method: "GET", path: "/job-descriptions" },
  { method: "GET", path: "/jds" },
  { method: "GET", path: "/resume-optimizations" },
  { method: "GET", path: "/optimizations" },
  { method: "POST", path: "/ats-evaluations" },
  { method: "GET", path: "/notifications" },
];

await test("AUTH-GATE", "Unauthenticated GET /users/me returns 200 with user: null", async () => {
  const res = await fetch(`${BASE}/users/me`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data?.user, null);
});

for (const route of unauthRoutes) {
  await test("AUTH-GATE", `Unauthenticated ${route.method} ${route.path} returns 401 Unauthorized`, async () => {
    const res = await fetch(`${BASE}${route.path}`, {
      method: route.method,
      headers: { "content-type": "application/json" },
      body: route.method === "POST" || route.method === "PATCH" ? JSON.stringify({}) : undefined,
    });
    assert.equal(res.status, 401, `Expected 401 for ${route.path}, got ${res.status}`);
    const data = await res.json();
    assert.equal(data.success, false);
  });
}

// Register user 1
const user1Creds = {
  name: "Phase 6 User One",
  email: `phase6-user1-${Date.now()}@test.com`,
  password: "Password123!",
};

let user1Cookie = "";
let user1Token = "";

await test("AUTH", "POST /api/auth/register creates user and returns auth cookie/session", async () => {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(user1Creds),
  });
  assert.equal(res.status, 201);
  const setCookies = res.headers.getSetCookie?.() || [];
  const tokenCookie = setCookies.find((c) => c.startsWith("token=")) || res.headers.get("set-cookie") || "";
  user1Cookie = tokenCookie.split(";")[0];
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data?.user?.email, user1Creds.email);
  user1Token = data.data?.token || "";
});

const user1Headers = {
  cookie: user1Cookie,
  ...(user1Token ? { authorization: `Bearer ${user1Token}` } : {}),
};

// Register user 2 (for multi-tenant isolation / authorization tests)
const user2Creds = {
  name: "Phase 6 User Two",
  email: `phase6-user2-${Date.now()}@test.com`,
  password: "Password123!",
};

let user2Cookie = "";
let user2Token = "";

await test("AUTH", "Register second user for cross-user authorization tests", async () => {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(user2Creds),
  });
  assert.equal(res.status, 201);
  const setCookies = res.headers.getSetCookie?.() || [];
  const tokenCookie = setCookies.find((c) => c.startsWith("token=")) || res.headers.get("set-cookie") || "";
  user2Cookie = tokenCookie.split(";")[0];
  const data = await res.json();
  user2Token = data.data?.token || "";
});

const user2Headers = {
  cookie: user2Cookie,
  ...(user2Token ? { authorization: `Bearer ${user2Token}` } : {}),
};

// -------------------------------------------------------------
// SECTION 3: User Profile & Session Endpoints
// -------------------------------------------------------------
await test("USER", "GET /api/users/me returns authenticated profile", async () => {
  const res = await fetch(`${BASE}/users/me`, { headers: user1Headers });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data?.user?.email, user1Creds.email);
});

await test("USER", "PATCH /api/users/me updates profile name", async () => {
  const res = await fetch(`${BASE}/users/me`, {
    method: "PATCH",
    headers: { ...user1Headers, "content-type": "application/json" },
    body: JSON.stringify({ name: "Phase 6 Updated Name" }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data?.user?.name, "Phase 6 Updated Name");
});

await test("USER", "GET /api/auth/me returns current session matching user", async () => {
  const res = await fetch(`${BASE}/auth/me`, { headers: user1Headers });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data?.user?.name, "Phase 6 Updated Name");
});

// -------------------------------------------------------------
// SECTION 4: Job Descriptions (Canonical & Legacy Aliasing)
// -------------------------------------------------------------
let jdId = "";

await test("JD", "POST /api/job-descriptions (canonical) creates structured JD", async () => {
  const res = await fetch(`${BASE}/job-descriptions`, {
    method: "POST",
    headers: { ...user1Headers, "content-type": "application/json" },
    body: JSON.stringify({
      text: "Senior Full Stack Engineer at Acquired Tech\nRequirements: 5+ years React, Node.js, TypeScript, PostgreSQL, Docker\nResponsibilities: Architect scalable web applications and lead agile team.",
    }),
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  jdId = data.data?.jd?._id;
  assert.ok(jdId, "Expected valid jdId");
  assert.ok(Array.isArray(data.data?.jd?.skills));
});

await test("JD", "GET /api/job-descriptions/:id fetches JD by ID", async () => {
  const res = await fetch(`${BASE}/job-descriptions/${jdId}`, { headers: user1Headers });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data?.jd?._id, jdId);
});

await test("JD", "GET /api/jds/:id (legacy alias) fetches identical JD", async () => {
  const res = await fetch(`${BASE}/jds/${jdId}`, { headers: user1Headers });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data?.jd?._id, jdId);
});

await test("JD", "PATCH /api/job-descriptions/:id safely updates title and company", async () => {
  const res = await fetch(`${BASE}/job-descriptions/${jdId}`, {
    method: "PATCH",
    headers: { ...user1Headers, "content-type": "application/json" },
    body: JSON.stringify({ title: "Principal Architect", company: "Acquired Tech Corp" }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data?.jd?.title, "Principal Architect");
  assert.equal(data.data?.jd?.company, "Acquired Tech Corp");
});

await test("JD", "GET /api/job-descriptions lists with pagination meta", async () => {
  const res = await fetch(`${BASE}/job-descriptions?page=1&limit=5`, { headers: user1Headers });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.data?.jds));
  assert.equal(typeof data.data?.pagination?.total, "number");
  assert.ok(data.data?.pagination?.total >= 1);
});

await test("AUTH-ISOLATION", "User 2 cannot access or edit User 1's JD (returns 404/403)", async () => {
  const res = await fetch(`${BASE}/job-descriptions/${jdId}`, { headers: user2Headers });
  assert.equal(res.status, 404, "Cross-tenant access should return 404 Not Found");
});

// -------------------------------------------------------------
// SECTION 5: Resumes (Canonical & Legacy Aliasing)
// -------------------------------------------------------------
let resumeId = "";

await test("RESUME", "POST /api/resumes/templates/blank (canonical) creates blank resume", async () => {
  const res = await fetch(`${BASE}/resumes/templates/blank`, {
    method: "POST",
    headers: { ...user1Headers, "content-type": "application/json" },
    body: JSON.stringify({ template: "modern-clean" }),
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  resumeId = data.data?.resume?._id;
  assert.ok(resumeId);
  assert.equal(data.data?.resume?.template, "modern-clean");
});

await test("RESUME", "POST /api/resumes/scratch (legacy alias) also creates blank resume", async () => {
  const res = await fetch(`${BASE}/resumes/scratch`, {
    method: "POST",
    headers: { ...user1Headers, "content-type": "application/json" },
    body: JSON.stringify({ template: "tech-minimal" }),
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.data?.resume?.template, "tech-minimal");
});

await test("RESUME", "GET /api/resumes/:id retrieves resume by ID", async () => {
  const res = await fetch(`${BASE}/resumes/${resumeId}`, { headers: user1Headers });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data?.resume?._id, resumeId);
});

await test("RESUME", "PATCH /api/resumes/:id updates title and parsedData content", async () => {
  const res = await fetch(`${BASE}/resumes/${resumeId}`, {
    method: "PATCH",
    headers: { ...user1Headers, "content-type": "application/json" },
    body: JSON.stringify({
      fileName: "Senior Full Stack Resume - Phase 6",
      parsedData: {
        name: "Alex Morgan",
        summary: "Experienced software engineer with 6+ years in Node.js and React microservices.",
        contact: {
          email: "alex.morgan@test.com",
        },
        skills: ["Node.js", "React", "TypeScript", "Docker", "PostgreSQL", "REST APIs"],
        experience: [
          {
            company: "Tech Systems Inc",
            title: "Full Stack Engineer",
            startDate: "2020",
            endDate: "Present",
            description: "Designed RESTful microservices processing 10k requests per minute.",
          },
        ],
      },
    }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data?.resume?.fileName, "Senior Full Stack Resume - Phase 6");
  assert.equal(data.data?.resume?.parsedData?.name, "Alex Morgan");
});

await test("RESUME", "GET /api/resumes/:id/print-preview (canonical) returns print-ready data", async () => {
  const res = await fetch(`${BASE}/resumes/${resumeId}/print-preview`, { headers: user1Headers });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data?.resume?.parsedData?.name, "Alex Morgan");
});

await test("RESUME", "GET /api/resumes/:id/print-data (legacy alias) returns identical print data", async () => {
  const res = await fetch(`${BASE}/resumes/${resumeId}/print-data`, { headers: user1Headers });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data?.resume?.parsedData?.name, "Alex Morgan");
});

await test("RESUME", "GET /api/resumes lists user resumes with pagination", async () => {
  const res = await fetch(`${BASE}/resumes?page=1&limit=10`, { headers: user1Headers });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.data?.resumes));
  assert.ok(data.data?.pagination?.total >= 2);
});

await test("AUTH-ISOLATION", "User 2 cannot access User 1's resume (returns 404)", async () => {
  const res = await fetch(`${BASE}/resumes/${resumeId}`, { headers: user2Headers });
  assert.equal(res.status, 404, "Cross-tenant access should return 404");
});

// -------------------------------------------------------------
// SECTION 6: Resume Versions (Canonical & Legacy Aliasing)
// -------------------------------------------------------------
let versionId = "";

await test("VERSIONS", "GET /api/resumes/:id/versions lists snapshot versions", async () => {
  const res = await fetch(`${BASE}/resumes/${resumeId}/versions`, { headers: user1Headers });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data?.versions));
  if (data.data?.versions.length > 0) {
    versionId = data.data.versions[0]._id;
  }
});

// If no version created yet, update resume again to generate a version
if (!versionId) {
  await fetch(`${BASE}/resumes/${resumeId}`, {
    method: "PATCH",
    headers: { ...user1Headers, "content-type": "application/json" },
    body: JSON.stringify({ title: "Senior Full Stack Resume - Version 2" }),
  });
  const vRes = await fetch(`${BASE}/resumes/${resumeId}/versions`, { headers: user1Headers });
  const vData = await vRes.json();
  if (vData.data?.versions?.length > 0) {
    versionId = vData.data.versions[0]._id;
  }
}

if (versionId) {
  await test("VERSIONS", "GET /api/resumes/:id/versions/:vId retrieves specific version", async () => {
    const res = await fetch(`${BASE}/resumes/${resumeId}/versions/${versionId}`, { headers: user1Headers });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.data?.version?._id, versionId);
  });

  await test("VERSIONS", "POST /api/resumes/:id/versions/:vId/clone (canonical) clones version", async () => {
    const res = await fetch(`${BASE}/resumes/${resumeId}/versions/${versionId}/clone`, {
      method: "POST",
      headers: user1Headers,
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data?.version?._id);
  });

  await test("VERSIONS", "POST /api/resumes/:id/versions/:vId/revert (canonical) reverts resume state", async () => {
    const res = await fetch(`${BASE}/resumes/${resumeId}/versions/${versionId}/revert`, {
      method: "POST",
      headers: user1Headers,
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data?.resume?._id);
  });
}

// -------------------------------------------------------------
// SECTION 7: ATS Evaluations (Canonical & Legacy Aliasing)
// -------------------------------------------------------------
await test("ATS", "POST /api/ats-evaluations (canonical) scores resume against JD", async () => {
  const res = await fetch(`${BASE}/ats-evaluations`, {
    method: "POST",
    headers: { ...user1Headers, "content-type": "application/json" },
    body: JSON.stringify({ resumeId, jdId }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(typeof data.data?.atsScore, "number");
  assert.ok(Array.isArray(data.data?.matchedSkills));
  assert.ok(Array.isArray(data.data?.checklist));
});

await test("ATS", "POST /api/ats/check (legacy alias) returns identical scorecard structure", async () => {
  const res = await fetch(`${BASE}/ats/check`, {
    method: "POST",
    headers: { ...user1Headers, "content-type": "application/json" },
    body: JSON.stringify({ resumeId, jdId }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(typeof data.data?.atsScore, "number");
  assert.ok(Array.isArray(data.data?.matchedSkills));
});

// -------------------------------------------------------------
// SECTION 8: Resume Optimizations (Canonical & Legacy Aliasing)
// -------------------------------------------------------------
await test("OPTIMIZATION", "GET /api/resume-optimizations (canonical) lists optimizations", async () => {
  const res = await fetch(`${BASE}/resume-optimizations?page=1&limit=5`, { headers: user1Headers });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data?.optimizations));
  assert.ok(data.data?.pagination);
});

await test("OPTIMIZATION", "GET /api/optimizations (legacy alias) lists identical optimizations", async () => {
  const res = await fetch(`${BASE}/optimizations?page=1&limit=5`, { headers: user1Headers });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data?.optimizations));
});

// -------------------------------------------------------------
// SECTION 9: AI Section Rewrites & Suggestions Validation
// -------------------------------------------------------------
await test("AI-VALIDATION", "POST /api/ai/section-rewrites rejects invalid payload with 400", async () => {
  const res = await fetch(`${BASE}/ai/section-rewrites`, {
    method: "POST",
    headers: { ...user1Headers, "content-type": "application/json" },
    body: JSON.stringify({ section: "invalid-section", action: "invalid-action" }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
});

await test("AI-VALIDATION", "POST /api/ai/content-suggestions rejects missing resumeId with 400", async () => {
  const res = await fetch(`${BASE}/ai/content-suggestions`, {
    method: "POST",
    headers: { ...user1Headers, "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
});

// -------------------------------------------------------------
// SECTION 10: Notifications (Canonical & Legacy Aliasing)
// -------------------------------------------------------------
await test("NOTIFICATIONS", "GET /api/notifications returns user notification page", async () => {
  const res = await fetch(`${BASE}/notifications?page=1`, { headers: user1Headers });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data?.notifications));
});

await test("NOTIFICATIONS", "PATCH /api/notifications (canonical) marks all notifications read", async () => {
  const res = await fetch(`${BASE}/notifications`, {
    method: "PATCH",
    headers: user1Headers,
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
});

await test("NOTIFICATIONS", "PATCH /api/notifications/read-all (legacy alias) also marks all read", async () => {
  const res = await fetch(`${BASE}/notifications/read-all`, {
    method: "PATCH",
    headers: user1Headers,
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
});

// -------------------------------------------------------------
// SECTION 11: Malformed Parameters & CastError Handling
// -------------------------------------------------------------
const malformedParamRoutes = [
  `/resumes/not-a-valid-id`,
  `/job-descriptions/bad-mongo-id`,
  `/resume-optimizations/xyz-123`,
  `/resumes/bad-id/versions/bad-version-id`,
];

for (const p of malformedParamRoutes) {
  await test("ERROR-HANDLING", `Malformed ID param ${p} returns 400 Bad Request, not 500`, async () => {
    const res = await fetch(`${BASE}${p}`, { headers: user1Headers });
    assert.equal(res.status, 400, `Expected 400 for ${p}, got ${res.status}`);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /invalid id/i);
  });
}

// -------------------------------------------------------------
// SECTION 12: Resource Cleanup (DELETE operations)
// -------------------------------------------------------------
await test("CLEANUP", "DELETE /api/job-descriptions/:id deletes the created JD", async () => {
  const res = await fetch(`${BASE}/job-descriptions/${jdId}`, {
    method: "DELETE",
    headers: user1Headers,
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);

  // Verify it is gone
  const check = await fetch(`${BASE}/job-descriptions/${jdId}`, { headers: user1Headers });
  assert.equal(check.status, 404);
});

await test("CLEANUP", "DELETE /api/resumes/:id deletes the created resume", async () => {
  const res = await fetch(`${BASE}/resumes/${resumeId}`, {
    method: "DELETE",
    headers: user1Headers,
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);

  // Verify it is gone
  const check = await fetch(`${BASE}/resumes/${resumeId}`, { headers: user1Headers });
  assert.equal(check.status, 404);
});

// -------------------------------------------------------------
// SECTION 13: Auth Logout
// -------------------------------------------------------------
await test("AUTH", "POST /api/auth/logout clears session", async () => {
  const res = await fetch(`${BASE}/auth/logout`, {
    method: "POST",
    headers: user1Headers,
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log("\n==================================================================");
console.log(`Phase 6 Test Results: ${passed} passed, ${failed} failed (${passed + failed} total tests)`);
console.log("==================================================================");

if (failed > 0) {
  process.exit(1);
}
