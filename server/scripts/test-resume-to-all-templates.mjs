import assert from "node:assert/strict";

const BASE = "http://127.0.0.1:5001/api";

const ALL_20_TEMPLATES = [
  "devport",
  "creative",
  "developer",
  "minimal",
  "oss-maintainer",
  "motion-studio",
  "seyi-editorial",
  "sameera-material",
  "resume-page",
  "poster",
  "spotlight",
  "dat-immersive",
  "nahuel-cosmos",
  "ramen-shop",
  "danny-webgl",
  "portfolio-os",
  "buffalo-room",
  "folio-2019",
  "notebook-room",
  "naresh-keyboard",
];

async function runResumeToTemplatesTest() {
  console.log("==================================================================");
  console.log("   Full Resume-to-Template Integration & Immutability Test Suite  ");
  console.log("==================================================================");

  const unique = Date.now();
  const email = `resume-tester-${unique}@test.com`;

  // 1. Register test user
  const regRes = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Resume Adapter Tester", email, password: "Password123!" }),
  });

  assert.equal(regRes.status, 201, "Failed to register test user");
  const setCookies = regRes.headers.getSetCookie?.() || [];
  const tokenCookie = setCookies.find((c) => c.startsWith("token=")) || regRes.headers.get("set-cookie") || "";
  const cookie = tokenCookie.split(";")[0];

  // 2. Upload / create a realistic resume in user account
  const sampleParsedData = {
    name: "Samantha Wright",
    title: "Senior Full-Stack Architect",
    summary: "Senior architect with 9+ years engineering scalable React/Node.js web systems and interactive 3D WebGL experiences.",
    contact: {
      email: "samantha@wright.dev",
      phone: "+1 555-0199",
      location: "Austin, TX",
      linkedin: "https://linkedin.com/in/samanthawright",
      github: "https://github.com/swright-dev",
      website: "https://samanthawright.dev",
    },
    skills: ["TypeScript", "React", "Node.js", "Three.js", "Docker", "GraphQL", "PostgreSQL"],
    experience: [
      {
        title: "Lead Web Architect",
        company: "Apex Cloud Solutions",
        location: "Austin, TX",
        startDate: "2021",
        endDate: "Present",
        description: "Leading frontend infrastructure for enterprise SaaS.\n• Architected design system used by 45 product teams.\n• Optimized WebGL bundle performance saving 1.4s FCP.",
        achievements: "Engineered high-throughput client state engine.",
        technologies: "TypeScript, React, TailwindCSS, Vite",
      },
      {
        title: "Full Stack Engineer",
        company: "PixelForge Media",
        location: "New York, NY",
        startDate: "2017",
        endDate: "2021",
        description: "Built interactive web applications and client dashboards.",
        achievements: "Delivered 12 client portfolio websites on time.",
        technologies: "JavaScript, React, Node.js",
      },
    ],
    education: [
      {
        degree: "B.S. in Computer Science",
        institution: "University of Texas at Austin",
        startDate: "2013",
        endDate: "2017",
        description: "Dean's Scholar.",
      },
    ],
    projects: [
      {
        name: "MeshPulse Analytics",
        description: "Real-time microservices latency monitor with interactive WebGL visualizer.",
        technologies: "TypeScript, Three.js, WebSocket",
        link: "https://github.com/swright-dev/meshpulse",
        liveDemo: "https://meshpulse.dev",
      },
    ],
    certifications: ["AWS Certified Developer — Associate"],
  };

  // 2. Create blank resume via API and populate with sample parsed data
  const createRes = await fetch(`${BASE}/resumes/blank`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ template: "classic-rose-serif" }),
  });
  const createBody = await createRes.json();
  assert.equal(createRes.status, 201, `Failed to create blank resume: ${JSON.stringify(createBody)}`);
  const resumeId = createBody.data?.resume?._id;
  assert.ok(resumeId, "Resume ID missing from response");

  const updateRes = await fetch(`${BASE}/resumes/${resumeId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ parsedData: sampleParsedData }),
  });
  const updateBody = await updateRes.json();
  assert.equal(updateRes.status, 200, `Failed to update resume: ${JSON.stringify(updateBody)}`);

  const resumeBeforeSnapshot = JSON.stringify(updateBody.data?.resume?.parsedData);
  console.log(`\n  ✅ Created & populated source resume via API (ID: ${resumeId})`);

  // 3. Test generate-from-resume across all 20 templates
  console.log("\n[Testing generate-from-resume API across all 20 Templates]:");
  let passed = 0;
  let failed = 0;

  for (const templateId of ALL_20_TEMPLATES) {
    process.stdout.write(`  [TEST] Template "${templateId.padEnd(16)}" ... `);

    const res = await fetch(`${BASE}/portfolios/generate/from-resume`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie,
      },
      body: JSON.stringify({
        resumeId,
        template: templateId,
        title: `Samantha's ${templateId} Portfolio`,
      }),
    });

    const body = await res.json();

    if (res.status === 201 && body.success && body.data?.portfolio) {
      const p = body.data.portfolio;
      assert.equal(p.design?.template, templateId, `Expected template ${templateId}, got ${p.design?.template}`);
      assert.equal(p.profile?.fullName, "Samantha Wright");
      assert.equal(p.profile?.headline, "Senior Full-Stack Architect");
      assert.ok(p.skills?.length >= 5, "Skills not mapped");
      assert.ok(p.experience?.length >= 2, "Experience not mapped");
      assert.ok(p.projects?.length >= 1, "Projects not mapped");
      assert.ok(p.socialLinks?.length >= 2, "Social links not mapped");
      console.log("✅ PASS (mapped & verified)");
      passed++;
    } else {
      console.log(`❌ FAIL (status: ${res.status}, error: ${JSON.stringify(body)})`);
      failed++;
    }
  }

  // 4. Verify Immutability of Original Resume in MongoDB
  const getResumeRes = await fetch(`${BASE}/resumes/${resumeId}`, {
    headers: { cookie },
  });
  const getResumeBody = await getResumeRes.json();
  assert.equal(getResumeRes.status, 200);
  const resumeAfterSnapshot = JSON.stringify(getResumeBody.data?.resume?.parsedData);
  assert.equal(
    resumeBeforeSnapshot,
    resumeAfterSnapshot,
    "CRITICAL: Original resume in database was modified during portfolio generation!"
  );
  console.log("\n  ✅ Immutability confirmed: Source resume in database was 100% untouched.");

  console.log("==================================================================");
  console.log(`Integration Test Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================================");

  if (failed > 0) process.exit(1);
}

runResumeToTemplatesTest().catch((err) => {
  console.error("Test Error:", err);
  process.exit(1);
});
