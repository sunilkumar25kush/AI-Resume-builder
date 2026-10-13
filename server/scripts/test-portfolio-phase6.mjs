/**
 * Phase 6 Automated Test Suite: Portfolio Publishing and Public Portfolio Routes
 *
 * Requirements Verified:
 * 1. PUB-1: Draft portfolio is private — GET /api/portfolios/public/:slug returns 404.
 * 2. PUB-2: Publish action transitions status to 'published' and publication.isPublic to true.
 * 3. PUB-3: Public route returns 200 for published portfolio with template data.
 * 4. PRIV-1: Privacy filtering strictly excludes userId, resumeId, _id, __v, account email, and credentials.
 * 5. SLUG-1: Custom collision-resistant slug generation and validation.
 * 6. SLUG-2: Duplicate slug rejection enforces database uniqueness and returns 409 Conflict.
 * 7. SLUG-3: Malformed slug (invalid characters or spaces) rejected with 400 Bad Request.
 * 8. UNPUB-1: Unpublish action sets status='draft' and immediately returns 404 to public requests.
 * 9. REPUB-1: Republish action restores public accessibility (HTTP 200).
 * 10. DEL-1: Deleted portfolio returns 404 on public route.
 * 11. SEO-1: Custom seoTitle and seoDescription persist cleanly and are returned to public clients.
 * 12. PERSIST-1: Edits to content do not reset publication status.
 * 13. GUEST-1: Public endpoint functions flawlessly without session cookies or authorization headers.
 */

import assert from "node:assert/strict";

const BASE = "http://localhost:5001/api";

console.log("==================================================================");
console.log("  Phase 6 Test Suite: Portfolio Publishing & Public Routes        ");
console.log("==================================================================\n");

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

async function createDraftPortfolio(cookie, title = "Jane Doe Portfolio") {
  const res = await fetch(`${BASE}/portfolios`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie,
    },
    body: JSON.stringify({
      title,
      profile: {
        fullName: "Jane Doe",
        headline: "Principal Cloud Architect",
        bio: "Specializing in distributed systems and high-throughput microservices.",
        email: "jane.public@example.com",
      },
      skills: [
        { name: "Kubernetes", category: "DevOps", level: "expert" },
        { name: "TypeScript", category: "Languages", level: "advanced" },
      ],
      projects: [
        {
          title: "CloudMesh Engine",
          description: "Service mesh with zero-latency sidecars.",
          tags: ["Go", "K8s"],
          liveUrl: "https://cloudmesh.io",
          featured: true,
        },
      ],
      design: {
        template: "developer",
        theme: "dark",
        primaryColor: "#059669",
      },
    }),
  });
  assert.equal(res.status, 201, "Failed to create draft portfolio");
  const data = await res.json();
  return data.data.portfolio;
}

async function main() {
  const runId = Date.now().toString(36);
  const user1Email = `phase6-user1-${runId}@example.com`;
  const user2Email = `phase6-user2-${runId}@example.com`;

  const { cookie: cookie1, user: user1 } = await registerUser("Jane Doe", user1Email, "StrongPass@12345");
  const { cookie: cookie2, user: user2 } = await registerUser("Mark Smith", user2Email, "StrongPass@12345");

  let portfolio1 = await createDraftPortfolio(cookie1, "Jane Cloud Portfolio");
  const slug1 = portfolio1.slug;

  // 1. PUB-1: Unpublished draft portfolio returns 404 on public route
  await test("PUB-1: Draft portfolio is private (public GET returns 404)", async () => {
    const res = await fetch(`${BASE}/portfolios/public/${slug1}`);
    assert.equal(res.status, 404, "Draft portfolio must not be accessible publicly");
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /not found/i);
  });

  // 2. PUB-2: Publish action transitions portfolio status to published
  await test("PUB-2: Publish action updates status to published & isPublic to true", async () => {
    const res = await fetch(`${BASE}/portfolios/${portfolio1._id}/publish`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookie1 },
      body: JSON.stringify({
        seoTitle: "Jane Doe — Principal Cloud Architect",
        seoDescription: "Portfolio of Jane Doe showcasing distributed systems and cloud projects.",
      }),
    });
    assert.equal(res.status, 200, "Publish endpoint failed");
    const body = await res.json();
    const updated = body.data.portfolio;
    assert.equal(updated.status, "published");
    assert.equal(updated.publication.isPublic, true);
    assert.ok(updated.publication.publishedAt, "publishedAt must be set");
    assert.equal(updated.publication.seoTitle, "Jane Doe — Principal Cloud Architect");
    portfolio1 = updated;
  });

  // 3. PUB-3: Public route returns 200 and approved portfolio data
  await test("PUB-3: Public route returns HTTP 200 for published portfolio", async () => {
    const res = await fetch(`${BASE}/portfolios/public/${slug1}`);
    assert.equal(res.status, 200, "Published portfolio should return 200");
    const body = await res.json();
    assert.equal(body.success, true);
    const pub = body.data.portfolio;
    assert.equal(pub.title, "Jane Cloud Portfolio");
    assert.equal(pub.profile.fullName, "Jane Doe");
    assert.equal(pub.skills.length, 2);
    assert.equal(pub.projects.length, 1);
    assert.equal(pub.design.template, "developer");
  });

  // 4. PRIV-1: Privacy filtering strictly excludes internal metadata, account email, & user IDs
  await test("PRIV-1: Public endpoint strictly filters private and internal database fields", async () => {
    const res = await fetch(`${BASE}/portfolios/public/${slug1}`);
    const body = await res.json();
    const pub = body.data.portfolio;

    // Database internals must NOT exist
    assert.equal(pub._id, undefined, "_id must not be exposed on public route");
    assert.equal(pub.userId, undefined, "userId must not be exposed on public route");
    assert.equal(pub.user, undefined, "user virtual must not be exposed on public route");
    assert.equal(pub.resumeId, undefined, "resumeId must not be exposed on public route");
    assert.equal(pub.__v, undefined, "__v must not be exposed on public route");

    // The user's private account email from User document must not be exposed anywhere in the raw response
    const rawString = JSON.stringify(body);
    assert.ok(!rawString.includes(user1Email), "Account login email must never leak in public JSON");
    assert.ok(!rawString.includes("password"), "Password fields must never leak");
  });

  // 5. SLUG-1: Publish with custom collision-resistant slug
  const customSlug = `jane-architect-${runId}`;
  await test("SLUG-1: Publish allows custom slug assignment", async () => {
    const res = await fetch(`${BASE}/portfolios/${portfolio1._id}/publish`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookie1 },
      body: JSON.stringify({ slug: customSlug }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.portfolio.slug, customSlug);

    // Old slug should now return 404
    const oldRes = await fetch(`${BASE}/portfolios/public/${slug1}`);
    assert.equal(oldRes.status, 404, "Old slug should return 404 after update");

    // New slug should return 200
    const newRes = await fetch(`${BASE}/portfolios/public/${customSlug}`);
    assert.equal(newRes.status, 200, "New slug should return 200");
    portfolio1 = body.data.portfolio;
  });

  // 6. SLUG-2: Duplicate slug rejection enforces database uniqueness (409 Conflict)
  await test("SLUG-2: Duplicate slug is rejected with 409 Conflict", async () => {
    // User 2 creates a portfolio and attempts to publish with User 1's active slug
    const user2Portfolio = await createDraftPortfolio(cookie2, "Mark Portfolio");
    const res = await fetch(`${BASE}/portfolios/${user2Portfolio._id}/publish`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookie2 },
      body: JSON.stringify({ slug: customSlug }),
    });
    assert.equal(res.status, 409, "Duplicate slug must return 409 Conflict");
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /already in use/i);
  });

  // 7. SLUG-3: Malformed slug rejected with 400 Bad Request
  await test("SLUG-3: Malformed slug (spaces/symbols) rejected with 400 Bad Request", async () => {
    const res = await fetch(`${BASE}/portfolios/${portfolio1._id}/publish`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookie1 },
      body: JSON.stringify({ slug: "INVALID SLUG WITH SPACES!" }),
    });
    assert.equal(res.status, 400, "Malformed slug must be rejected with 400");
  });

  // 8. UNPUB-1: Unpublish action sets status='draft' and public route returns 404
  await test("UNPUB-1: Unpublish reverts status to draft and makes public route return 404", async () => {
    const res = await fetch(`${BASE}/portfolios/${portfolio1._id}/unpublish`, {
      method: "POST",
      headers: { cookie: cookie1 },
    });
    assert.equal(res.status, 200, "Unpublish call failed");
    const body = await res.json();
    assert.equal(body.data.portfolio.status, "draft");
    assert.equal(body.data.portfolio.publication.isPublic, false);

    // Public route must now return 404
    const pubRes = await fetch(`${BASE}/portfolios/public/${customSlug}`);
    assert.equal(pubRes.status, 404, "Unpublished portfolio must immediately return 404");
  });

  // 9. REPUB-1: Republish action restores public access
  await test("REPUB-1: Republish action restores public accessibility (HTTP 200)", async () => {
    const res = await fetch(`${BASE}/portfolios/${portfolio1._id}/publish`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookie1 },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.portfolio.status, "published");

    const pubRes = await fetch(`${BASE}/portfolios/public/${customSlug}`);
    assert.equal(pubRes.status, 200, "Republished portfolio must return 200");
  });

  // 10. SEO-1: Custom SEO metadata persists and is accessible on public route
  await test("SEO-1: Custom SEO title and description are returned in publication block", async () => {
    const res = await fetch(`${BASE}/portfolios/${portfolio1._id}/publish`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookie1 },
      body: JSON.stringify({
        seoTitle: "Custom High-Rank Title",
        seoDescription: "Custom meta description for search preview.",
      }),
    });
    assert.equal(res.status, 200);

    const pubRes = await fetch(`${BASE}/portfolios/public/${customSlug}`);
    const pubBody = await pubRes.json();
    assert.equal(pubBody.data.portfolio.publication.seoTitle, "Custom High-Rank Title");
    assert.equal(pubBody.data.portfolio.publication.seoDescription, "Custom meta description for search preview.");
  });

  // 11. PERSIST-1: Subsequent content updates maintain published status
  await test("PERSIST-1: Editing portfolio content does not accidentally unpublish it", async () => {
    const updateRes = await fetch(`${BASE}/portfolios/${portfolio1._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", cookie: cookie1 },
      body: JSON.stringify({
        profile: { headline: "Distinguished Fellow" },
      }),
    });
    assert.equal(updateRes.status, 200);
    const updated = (await updateRes.json()).data.portfolio;
    assert.equal(updated.status, "published", "Status must remain published after content edit");
    assert.equal(updated.publication.isPublic, true);

    const pubRes = await fetch(`${BASE}/portfolios/public/${customSlug}`);
    assert.equal(pubRes.status, 200);
    const pubBody = await pubRes.json();
    assert.equal(pubBody.data.portfolio.profile.headline, "Distinguished Fellow");
  });

  // 12. GUEST-1: Public endpoint functions without any cookies or headers
  await test("GUEST-1: Completely unauthenticated guests can fetch public portfolio", async () => {
    const res = await fetch(`${BASE}/portfolios/public/${customSlug}`, {
      headers: {}, // strictly empty headers
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.portfolio.title);
  });

  // 13. DEL-1: Deleting a portfolio immediately returns 404 on public route
  await test("DEL-1: Deleted portfolio returns 404 on public route", async () => {
    const delRes = await fetch(`${BASE}/portfolios/${portfolio1._id}`, {
      method: "DELETE",
      headers: { cookie: cookie1 },
    });
    assert.equal(delRes.status, 200, "Delete call failed");

    const pubRes = await fetch(`${BASE}/portfolios/public/${customSlug}`);
    assert.equal(pubRes.status, 404, "Deleted portfolio must return 404");
  });

  console.log("\n==================================================================");
  console.log(`  Phase 6 Test Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test execution aborted:", err);
  process.exit(1);
});
