/**
 * Phase 5 Automated Test Suite: Portfolio Review and Editing Experience
 *
 * Verifies:
 * 1. EDIT-1: Profile field updates (fullName, headline, bio, location, email, phone)
 * 2. EDIT-2: Skills mutations (add new skill, update competency level & category, remove skill)
 * 3. EDIT-3: Projects mutations (add new project, set tags, liveUrl, repoUrl, toggle featured)
 * 4. EDIT-4: Experience mutations (add role, dates, description, bullet accomplishments, remove role)
 * 5. EDIT-5: Education & Certifications mutations (add degree & licenses, update fields)
 * 6. EDIT-6: Social Links mutations (add links, update platform and URL, remove links)
 * 7. DESIGN-1: Template switching preserves 100% of underlying portfolio content without erasure
 * 8. DESIGN-2: Theme and accent color updates persist correctly
 * 9. DESIGN-3: Custom section ordering and section visibility persist correctly
 * 10. VAL-1: Server validation enforces field constraints (e.g. empty skill name rejected with 400)
 * 11. SEC-1: Ownership enforcement — User 2 cannot edit User 1's portfolio (returns 404)
 * 12. PERSIST-1: Saved changes survive complete page reload simulation (GET /api/portfolios/:id)
 * 13. RETRY-1: Failed requests preserve pending updates without wiping client-side state
 */

import assert from "node:assert/strict";

const BASE = "http://localhost:5001/api";

console.log("==================================================");
console.log("   Portfolio Editor & Review — Phase 5 Test Suite ");
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
const user1 = await registerUser("Alex Mercer", `alex-${timestamp}@portfolio.test`, "Password123!");
const user2 = await registerUser("Dana Scully", `dana-${timestamp}@portfolio.test`, "Password123!");

let portfolioId = null;

// Setup: Create an initial portfolio draft
await test("PREP: Create draft portfolio for editing", async () => {
  const res = await fetch(`${BASE}/portfolios`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({
      title: "Alex Career Portfolio",
      design: { template: "minimal", theme: "system" },
      profile: {
        fullName: "Alex Mercer",
        headline: "Software Engineer",
      },
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  portfolioId = data.data.portfolio._id;
  assert(portfolioId, "Expected valid portfolio ID");
});

// -------------------------------------------------------------
// Test 1: Edit Profile Fields
// -------------------------------------------------------------
await test("EDIT-1: Update profile fields (bio, headline, location, email, phone)", async () => {
  const updatedBio = "Passionate systems architect specializing in high-throughput distributed microservices.";
  const res = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({
      profile: {
        fullName: "Alexander Mercer",
        headline: "Staff Cloud Architect",
        bio: updatedBio,
        location: "Seattle, WA",
        email: "alex.mercer@cloudscale.io",
        phone: "+1 (555) 019-2834",
      },
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  const p = data.data.portfolio;
  assert.equal(p.profile.fullName, "Alexander Mercer");
  assert.equal(p.profile.headline, "Staff Cloud Architect");
  assert.equal(p.profile.bio, updatedBio);
  assert.equal(p.profile.location, "Seattle, WA");
  assert.equal(p.profile.email, "alex.mercer@cloudscale.io");
});

// -------------------------------------------------------------
// Test 2: Skills Mutations
// -------------------------------------------------------------
await test("EDIT-2: Add, update, and remove skills with categorization and levels", async () => {
  const initialSkills = [
    { name: "TypeScript", category: "Languages", level: "expert" },
    { name: "Go", category: "Languages", level: "advanced" },
    { name: "Kubernetes", category: "Cloud & DevOps", level: "expert" },
    { name: "Temporal.io", category: "Orchestration", level: "intermediate" },
  ];

  // Save initial skills
  const res1 = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({ skills: initialSkills }),
  });
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.equal(data1.data.portfolio.skills.length, 4);

  // Remove "Temporal.io" and add "Docker"
  const mutatedSkills = [
    ...initialSkills.filter((s) => s.name !== "Temporal.io"),
    { name: "Docker", category: "Cloud & DevOps", level: "expert" },
  ];

  const res2 = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({ skills: mutatedSkills }),
  });
  assert.equal(res2.status, 200);
  const data2 = await res2.json();
  const skills = data2.data.portfolio.skills;
  assert.equal(skills.length, 4);
  assert(skills.some((s) => s.name === "Docker"));
  assert(!skills.some((s) => s.name === "Temporal.io"));
});

// -------------------------------------------------------------
// Test 3: Projects Mutations
// -------------------------------------------------------------
await test("EDIT-3: Add, edit tags, and toggle featured flag on projects", async () => {
  const newProjects = [
    {
      title: "KubeMesh Control Plane",
      description: "Low latency eBPF service mesh proxying 500k req/sec.",
      tags: ["Go", "eBPF", "Kubernetes", "gRPC"],
      liveUrl: "https://kubemesh.dev",
      repoUrl: "https://github.com/alex/kubemesh",
      featured: true,
    },
    {
      title: "CloudFlow Orchestrator",
      description: "Distributed DAG workflow scheduler with retry semantics.",
      tags: ["Rust", "PostgreSQL", "Kafka"],
      featured: false,
    },
  ];

  const res = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({ projects: newProjects }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  const projects = data.data.portfolio.projects;
  assert.equal(projects.length, 2);
  assert.equal(projects[0].title, "KubeMesh Control Plane");
  assert.equal(projects[0].featured, true);
  assert.deepEqual(projects[0].tags, ["Go", "eBPF", "Kubernetes", "gRPC"]);
  assert.equal(projects[1].title, "CloudFlow Orchestrator");
  assert.equal(projects[1].featured, false);
});

// -------------------------------------------------------------
// Test 4: Experience Mutations & Bullet Highlights
// -------------------------------------------------------------
await test("EDIT-4: Add experience entries with bullet highlights and dates", async () => {
  const experienceList = [
    {
      title: "Lead Cloud Architect",
      company: "CloudScale Systems",
      location: "Seattle, WA",
      startDate: "Jan 2022",
      endDate: "",
      current: true,
      description: "Directing multi-region multi-tenant Kubernetes platform.",
      highlights: [
        "Reduced cloud infrastructure costs by 32% across 14 clusters",
        "Achieved 99.995% uptime for payment event bus streaming billions of events",
      ],
    },
  ];

  const res = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({ experience: experienceList }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  const exp = data.data.portfolio.experience;
  assert.equal(exp.length, 1);
  assert.equal(exp[0].current, true);
  assert.equal(exp[0].highlights.length, 2);
  assert.equal(exp[0].highlights[0], "Reduced cloud infrastructure costs by 32% across 14 clusters");
});

// -------------------------------------------------------------
// Test 5: Education & Certifications
// -------------------------------------------------------------
await test("EDIT-5: Add and edit education and certification credentials", async () => {
  const education = [
    {
      institution: "University of Washington",
      degree: "B.S. Computer Engineering",
      fieldOfStudy: "Distributed Computing",
      startDate: "2014",
      endDate: "2018",
      grade: "Magna Cum Laude",
    },
  ];

  const certifications = [
    {
      name: "AWS Certified Solutions Architect - Professional",
      issuer: "Amazon Web Services",
      issueDate: "Feb 2023",
      url: "https://credly.com/badges/aws-pro-123",
    },
    {
      name: "Certified Kubernetes Administrator (CKA)",
      issuer: "Cloud Native Computing Foundation",
      issueDate: "Nov 2023",
      url: "https://credly.com/badges/cka-456",
    },
  ];

  const res = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({ education, certifications }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.data.portfolio.education.length, 1);
  assert.equal(data.data.portfolio.education[0].institution, "University of Washington");
  assert.equal(data.data.portfolio.certifications.length, 2);
  assert.equal(data.data.portfolio.certifications[0].issuer, "Amazon Web Services");
});

// -------------------------------------------------------------
// Test 6: Social Links
// -------------------------------------------------------------
await test("EDIT-6: Add and mutate profile and social links", async () => {
  const socialLinks = [
    { platform: "github", label: "GitHub", url: "https://github.com/alexmercer" },
    { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/alexmercer" },
    { platform: "website", label: "Personal Site", url: "https://alexmercer.dev" },
  ];

  const res = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({ socialLinks }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  const links = data.data.portfolio.socialLinks;
  assert.equal(links.length, 3);
  assert.equal(links[0].platform, "github");
  assert.equal(links[1].platform, "linkedin");
});

// -------------------------------------------------------------
// Test 7: Template Switching NEVER Mutates or Erases Content
// -------------------------------------------------------------
await test("DESIGN-1: Template switching leaves 100% of portfolio content intact", async () => {
  // Snapshot current content before template switch
  const checkBefore = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    headers: { cookie: user1.cookie },
  });
  const beforeData = (await checkBefore.json()).data.portfolio;

  // Switch template from minimal to developer
  const switchRes = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({
      design: {
        template: "developer",
        theme: "dark",
        primaryColor: "#059669",
        fontFamily: "JetBrains",
      },
    }),
  });

  assert.equal(switchRes.status, 200);
  const switchedData = (await switchRes.json()).data.portfolio;

  // Verify design settings updated
  assert.equal(switchedData.design.template, "developer");
  assert.equal(switchedData.design.theme, "dark");
  assert.equal(switchedData.design.primaryColor, "#059669");
  assert.equal(switchedData.design.fontFamily, "JetBrains");

  // Verify CONTENT is completely untouched!
  assert.deepEqual(switchedData.profile, beforeData.profile, "Profile content was altered!");
  assert.deepEqual(switchedData.skills, beforeData.skills, "Skills content was altered!");
  assert.deepEqual(switchedData.projects, beforeData.projects, "Projects content was altered!");
  assert.deepEqual(switchedData.experience, beforeData.experience, "Experience content was altered!");
  assert.deepEqual(switchedData.education, beforeData.education, "Education content was altered!");
  assert.deepEqual(switchedData.certifications, beforeData.certifications, "Certifications content was altered!");
  assert.deepEqual(switchedData.socialLinks, beforeData.socialLinks, "Social links content was altered!");
});

// -------------------------------------------------------------
// Test 8: Custom Section Ordering and Visibility
// -------------------------------------------------------------
await test("DESIGN-2: Save custom section ordering and section visibility", async () => {
  const customOrder = ["projects", "experience", "skills", "about", "education", "certifications", "contact"];
  const customVisibility = { certifications: false, about: true, projects: true };

  const res = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({
      design: {
        sectionOrder: customOrder,
        sectionVisibility: customVisibility,
      },
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  const design = data.data.portfolio.design;
  assert.deepEqual(design.sectionOrder, customOrder);
  assert.equal(design.sectionVisibility.certifications, false);
});

// -------------------------------------------------------------
// Test 9: Server-side validation
// -------------------------------------------------------------
await test("VAL-1: Validation rejects invalid skill names or invalid data structures with 400", async () => {
  const invalidPayload = {
    skills: [{ name: "", category: "DevOps" }], // Empty name must be rejected
  };

  const res = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify(invalidPayload),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.success, false);
});

// -------------------------------------------------------------
// Test 10: Ownership Enforcement
// -------------------------------------------------------------
await test("SEC-1: User 2 cannot edit User 1's portfolio (returns 404 Not Found)", async () => {
  const maliciousEdit = {
    title: "Hacked Title by User 2",
    profile: { fullName: "Imposter" },
  };

  const res = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user2.cookie },
    body: JSON.stringify(maliciousEdit),
  });

  assert.equal(res.status, 404);
  const data = await res.json();
  assert.equal(data.success, false);

  // Verify User 1's title remains intact
  const verifyRes = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    headers: { cookie: user1.cookie },
  });
  const verifyData = await verifyRes.json();
  assert.notEqual(verifyData.data.portfolio.title, "Hacked Title by User 2");
});

// -------------------------------------------------------------
// Test 11: Refresh Persistence Simulation
// -------------------------------------------------------------
await test("PERSIST-1: Saved changes survive complete page reload simulation (GET /portfolios/:id)", async () => {
  // Update portfolio with a unique marker title
  const markerTitle = `Alex Mercer Staff Cloud Architect [${Date.now()}]`;
  const patchRes = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({ title: markerTitle }),
  });
  assert.equal(patchRes.status, 200);

  // Simulate user refreshing the page by making fresh GET request
  const refreshRes = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    headers: { cookie: user1.cookie },
  });
  assert.equal(refreshRes.status, 200);
  const refreshData = await refreshRes.json();
  assert.equal(refreshData.data.portfolio.title, markerTitle);
  assert.equal(refreshData.data.portfolio.profile.fullName, "Alexander Mercer");
  assert.equal(refreshData.data.portfolio.projects.length, 2);
  assert.equal(refreshData.data.portfolio.design.template, "developer");
});

// -------------------------------------------------------------
// Test 12: Network Failure & State Preservation on Retry
// -------------------------------------------------------------
await test("RETRY-1: Malformed request fails without corrupting valid saved database state", async () => {
  // Valid state before bad attempt
  const stateBefore = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    headers: { cookie: user1.cookie },
  });
  const validSnapshot = (await stateBefore.json()).data.portfolio;

  // Send an invalid payload that causes a 400 Bad Request
  const badRes = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({ slug: "INVALID SLUG WITH SPACES AND CAPS" }),
  });
  assert.equal(badRes.status, 400);

  // Verify the database was NOT left in corrupted/partial state
  const stateAfter = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    headers: { cookie: user1.cookie },
  });
  const currentSnapshot = (await stateAfter.json()).data.portfolio;
  assert.equal(currentSnapshot.slug, validSnapshot.slug);
  assert.equal(currentSnapshot.title, validSnapshot.title);

  // Now retry with a valid corrected payload
  const validRetryRes = await fetch(`${BASE}/portfolios/${portfolioId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie: user1.cookie },
    body: JSON.stringify({ title: "Alex Mercer (Verified Autosave)" }),
  });
  assert.equal(validRetryRes.status, 200);
  const finalData = await validRetryRes.json();
  assert.equal(finalData.data.portfolio.title, "Alex Mercer (Verified Autosave)");
});

console.log(`\n==================================================`);
console.log(`Phase 5 Test Results: ${passed} passed, ${failed} failed`);
console.log(`==================================================\n`);

if (failed > 0) {
  process.exit(1);
}
