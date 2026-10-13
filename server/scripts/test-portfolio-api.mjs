import assert from "node:assert/strict";

const BASE = "http://127.0.0.1:5001/api";

console.log("==================================================");
console.log("   Portfolio API — Phase 2 Test Suite             ");
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
// Helper to register and get cookie
// -------------------------------------------------------------
async function registerUser(name, email, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  assert.equal(res.status, 201, `Failed to register user ${email}`);
  const setCookies = res.headers.getSetCookie?.() || [];
  const tokenCookie = setCookies.find((c) => c.startsWith("token=")) || res.headers.get("set-cookie") || "";
  const cookie = tokenCookie.split(";")[0];
  const body = await res.json();
  return { cookie, user: body.data.user };
}

const timestamp = Date.now();
const user1 = await registerUser("User One", `user1-${timestamp}@portfolio.test`, "Password123!");
const user2 = await registerUser("User Two", `user2-${timestamp}@portfolio.test`, "Password123!");

// -------------------------------------------------------------
// Test 1: Authorization — Unauthenticated access blocked
// -------------------------------------------------------------
await test("AUTH-1: Unauthenticated requests to private endpoints return 401", async () => {
  const endpoints = [
    { method: "GET", url: `${BASE}/portfolios` },
    { method: "POST", url: `${BASE}/portfolios`, body: { title: "Draft" } },
    { method: "GET", url: `${BASE}/portfolios/507f1f77bcf86cd799439011` },
    { method: "PATCH", url: `${BASE}/portfolios/507f1f77bcf86cd799439011`, body: { title: "Updated" } },
    { method: "DELETE", url: `${BASE}/portfolios/507f1f77bcf86cd799439011` },
    { method: "POST", url: `${BASE}/portfolios/507f1f77bcf86cd799439011/publish` },
    { method: "POST", url: `${BASE}/portfolios/507f1f77bcf86cd799439011/unpublish` },
  ];

  for (const ep of endpoints) {
    const res = await fetch(ep.url, {
      method: ep.method,
      headers: ep.body ? { "content-type": "application/json" } : {},
      body: ep.body ? JSON.stringify(ep.body) : undefined,
    });
    assert.equal(res.status, 401, `Expected 401 for ${ep.method} ${ep.url}, got ${res.status}`);
  }
});

// -------------------------------------------------------------
// Test 2: Validation — Missing required title
// -------------------------------------------------------------
await test("VAL-1: POST /api/portfolios requires non-empty title (returns 400)", async () => {
  const res = await fetch(`${BASE}/portfolios`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({ title: "" }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
});

// -------------------------------------------------------------
// Test 3: Validation — Invalid slug format
// -------------------------------------------------------------
await test("VAL-2: Invalid slug format rejected with 400", async () => {
  const res = await fetch(`${BASE}/portfolios`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({ title: "My Portfolio", slug: "INVALID SLUG WITH SPACES!" }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
});

// -------------------------------------------------------------
// Test 4: CRUD — Create a valid draft portfolio
// -------------------------------------------------------------
let createdPortfolio;
const customSlug = `alex-portfolio-${timestamp}`;

await test("CRUD-1: Create draft portfolio successfully (returns 201)", async () => {
  const payload = {
    title: "Alex Smith — Full Stack Engineer",
    slug: customSlug,
    profile: {
      fullName: "Alex Smith",
      headline: "Senior Software Engineer",
      bio: "Passionate engineer building distributed systems",
      email: "alex@example.com",
      location: "San Francisco, CA",
    },
    skills: [
      { name: "React", category: "Frontend", level: "expert" },
      { name: "Node.js", category: "Backend", level: "expert" },
    ],
    experience: [
      {
        title: "Staff Engineer",
        company: "Acme Corp",
        startDate: "2022",
        current: true,
        description: "Leading frontend infrastructure and microfrontends",
        highlights: ["Improved performance by 40%"],
      },
    ],
    projects: [
      {
        title: "AI Resume Builder",
        description: "Full-stack resume optimization app",
        tags: ["React", "Express", "Node.js"],
        featured: true,
      },
    ],
    design: {
      template: "developer",
      theme: "dark",
      primaryColor: "#3b82f6",
    },
  };

  const res = await fetch(`${BASE}/portfolios`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify(payload),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.data?.portfolio?._id);
  assert.equal(data.data.portfolio.title, payload.title);
  assert.equal(data.data.portfolio.slug, customSlug);
  assert.equal(data.data.portfolio.status, "draft");
  assert.equal(data.data.portfolio.publication?.isPublic, false);
  assert.equal(data.data.portfolio.design?.template, "developer");
  assert.equal(data.data.portfolio.skills?.length, 2);

  createdPortfolio = data.data.portfolio;
});

// -------------------------------------------------------------
// Test 5: Validation — Duplicate slug rejected (returns 409)
// -------------------------------------------------------------
await test("SLUG-1: Creating portfolio with existing slug returns 409 Conflict", async () => {
  const res = await fetch(`${BASE}/portfolios`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({
      title: "Another Portfolio",
      slug: customSlug, // already taken by createdPortfolio
    }),
  });

  assert.equal(res.status, 409);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.message, /already in use/i);
});

// -------------------------------------------------------------
// Test 6: Security — Mass assignment protection on userId
// -------------------------------------------------------------
await test("SEC-1: Arbitrary mass assignment of userId is rejected or ignored", async () => {
  const fakeUserId = "507f1f77bcf86cd799439099";
  const res = await fetch(`${BASE}/portfolios`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({
      title: "Hacked Portfolio",
      slug: `hacked-${timestamp}`,
      userId: fakeUserId,
      user: fakeUserId,
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  // Owner must strictly be user1, not the attacker-supplied fakeUserId
  assert.equal(String(data.data.portfolio.userId), String(user1.user.id || user1.user._id));
});

// -------------------------------------------------------------
// Test 7: Public Route — Draft portfolio returns 404 (not exposed)
// -------------------------------------------------------------
await test("PUB-1: Draft portfolio is NOT publicly accessible (returns 404)", async () => {
  const res = await fetch(`${BASE}/portfolios/public/${customSlug}`);
  assert.equal(res.status, 404);
  const data = await res.json();
  assert.equal(data.success, false);
});

// -------------------------------------------------------------
// Test 8: CRUD — List user portfolios with pagination
// -------------------------------------------------------------
await test("CRUD-2: GET /api/portfolios returns user's portfolios with pagination", async () => {
  const res = await fetch(`${BASE}/portfolios?page=1&limit=10`, {
    headers: { cookie: user1.cookie },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data.portfolios));
  assert.ok(data.data.portfolios.length >= 2);
  assert.equal(data.data.pagination.page, 1);
  assert.equal(data.data.pagination.limit, 10);
  assert.ok(data.data.pagination.total >= 2);
});

// -------------------------------------------------------------
// Test 9: CRUD — Fetch specific portfolio by ID
// -------------------------------------------------------------
await test("CRUD-3: GET /api/portfolios/:id fetches portfolio", async () => {
  const res = await fetch(`${BASE}/portfolios/${createdPortfolio._id}`, {
    headers: { cookie: user1.cookie },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.portfolio._id, createdPortfolio._id);
  assert.equal(data.data.portfolio.title, createdPortfolio.title);
});

// -------------------------------------------------------------
// Test 10: Authorization / Ownership — User2 cannot read User1's portfolio
// -------------------------------------------------------------
await test("AUTH-2: User2 cannot read User1's portfolio (returns 404)", async () => {
  const res = await fetch(`${BASE}/portfolios/${createdPortfolio._id}`, {
    headers: { cookie: user2.cookie },
  });
  assert.equal(res.status, 404);
});

// -------------------------------------------------------------
// Test 11: Authorization / Ownership — User2 cannot update User1's portfolio
// -------------------------------------------------------------
await test("AUTH-3: User2 cannot update User1's portfolio (returns 404)", async () => {
  const res = await fetch(`${BASE}/portfolios/${createdPortfolio._id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user2.cookie },
    body: JSON.stringify({ title: "Tampered Title" }),
  });
  assert.equal(res.status, 404);
});

// -------------------------------------------------------------
// Test 12: CRUD — Update permitted fields
// -------------------------------------------------------------
await test("CRUD-4: Owner can update permitted fields", async () => {
  const updatePayload = {
    title: "Alex Smith — Principal Architect",
    design: {
      theme: "light",
      primaryColor: "#10b981",
    },
  };

  const res = await fetch(`${BASE}/portfolios/${createdPortfolio._id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify(updatePayload),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.portfolio.title, updatePayload.title);
  assert.equal(data.data.portfolio.design.theme, "light");
  assert.equal(data.data.portfolio.design.primaryColor, "#10b981");
  // Ensure template wasn't wiped by partial design patch
  assert.equal(data.data.portfolio.design.template, "developer");
});

// -------------------------------------------------------------
// Test 13: State Transition — Publish portfolio
// -------------------------------------------------------------
await test("STATE-1: POST /api/portfolios/:id/publish transitions to published", async () => {
  const res = await fetch(`${BASE}/portfolios/${createdPortfolio._id}/publish`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({
      seoTitle: "Alex Smith Portfolio",
      seoDescription: "Portfolio of Alex Smith, Principal Architect",
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.portfolio.status, "published");
  assert.equal(data.data.portfolio.publication.isPublic, true);
  assert.ok(data.data.portfolio.publication.publishedAt);
  assert.equal(data.data.portfolio.publication.seoTitle, "Alex Smith Portfolio");
});

// -------------------------------------------------------------
// Test 14: Public Route — Published portfolio accessible without sensitive fields
// -------------------------------------------------------------
await test("PUB-2: GET /api/portfolios/public/:slug serves published portfolio without sensitive fields", async () => {
  const res = await fetch(`${BASE}/portfolios/public/${customSlug}`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  const pub = data.data.portfolio;
  assert.equal(pub.slug, customSlug);
  assert.equal(pub.title, "Alex Smith — Principal Architect");
  assert.ok(pub.profile?.fullName, "Profile should be present");
  assert.ok(pub.skills?.length > 0, "Skills should be present");

  // CRITICAL SECURITY CHECKS: Sensitive fields MUST NOT BE EXPOSED
  assert.equal(pub.userId, undefined, "userId must NOT be exposed in public response");
  assert.equal(pub.user, undefined, "user must NOT be exposed in public response");
  assert.equal(pub.resumeId, undefined, "resumeId must NOT be exposed in public response");
  assert.equal(pub._id, undefined, "_id should not be exposed in public response");
  assert.equal(pub.__v, undefined, "__v must NOT be exposed in public response");
});

// -------------------------------------------------------------
// Test 15: State Transition — Unpublish portfolio
// -------------------------------------------------------------
await test("STATE-2: POST /api/portfolios/:id/unpublish reverts to draft", async () => {
  const res = await fetch(`${BASE}/portfolios/${createdPortfolio._id}/unpublish`, {
    method: "POST",
    headers: { cookie: user1.cookie },
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.portfolio.status, "draft");
  assert.equal(data.data.portfolio.publication.isPublic, false);

  // Immediate public access check: Must be 404 again
  const pubRes = await fetch(`${BASE}/portfolios/public/${customSlug}`);
  assert.equal(pubRes.status, 404);
});

// -------------------------------------------------------------
// Test 16: Error handling — Malformed ObjectId returns 400
// -------------------------------------------------------------
await test("ERR-1: Malformed ObjectId returns 400 Bad Request", async () => {
  const res = await fetch(`${BASE}/portfolios/not-a-valid-object-id`, {
    headers: { cookie: user1.cookie },
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.match(data.message, /invalid id format/i);
});

// -------------------------------------------------------------
// Test 17: Error handling — Non-existent ObjectId returns 404
// -------------------------------------------------------------
await test("ERR-2: Non-existent ObjectId returns 404 Not Found", async () => {
  const res = await fetch(`${BASE}/portfolios/507f1f77bcf86cd799439011`, {
    headers: { cookie: user1.cookie },
  });
  assert.equal(res.status, 404);
});

// -------------------------------------------------------------
// Test 18: CRUD — Delete portfolio
// -------------------------------------------------------------
await test("CRUD-5: DELETE /api/portfolios/:id deletes portfolio", async () => {
  const res = await fetch(`${BASE}/portfolios/${createdPortfolio._id}`, {
    method: "DELETE",
    headers: { cookie: user1.cookie },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.data.deleted, true);

  // Subsequent fetch must return 404
  const checkRes = await fetch(`${BASE}/portfolios/${createdPortfolio._id}`, {
    headers: { cookie: user1.cookie },
  });
  assert.equal(checkRes.status, 404);
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log("\n==================================================");
console.log(`Portfolio API Test Results: ${passed} passed, ${failed} failed`);
console.log("==================================================");

process.exit(failed > 0 ? 1 : 0);
