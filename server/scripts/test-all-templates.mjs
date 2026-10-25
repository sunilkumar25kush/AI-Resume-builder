import assert from "node:assert/strict";

const BASE = "http://127.0.0.1:5001/api";

const ALL_TEMPLATES = [
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

async function run() {
  console.log("==================================================");
  console.log("   All 20 Templates Backend Validation Suite     ");
  console.log("==================================================");

  const unique = Date.now();
  const email = `templates-${unique}@test.com`;

  // 1. Register test user and get cookie
  const regRes = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Template Tester", email, password: "Password123!" }),
  });

  assert.equal(regRes.status, 201, "Failed to register test user");
  const setCookies = regRes.headers.getSetCookie?.() || [];
  const tokenCookie = setCookies.find((c) => c.startsWith("token=")) || regRes.headers.get("set-cookie") || "";
  const cookie = tokenCookie.split(";")[0];

  let passed = 0;
  let failed = 0;

  for (const templateId of ALL_TEMPLATES) {
    process.stdout.write(`  [TEST] Validate template: "${templateId}" ... `);
    const slug = `tpl-${templateId.toLowerCase()}-${unique}`;

    const createRes = await fetch(`${BASE}/portfolios`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie,
      },
      body: JSON.stringify({
        title: `Portfolio in ${templateId}`,
        slug,
        design: {
          template: templateId,
          theme: "dark",
          primaryColor: "#2563eb",
        },
      }),
    });

    const body = await createRes.json();

    if (createRes.status === 201 && body.data?.portfolio?.design?.template === templateId) {
      console.log("✅ PASS");
      passed++;
    } else {
      console.log(`❌ FAIL (status: ${createRes.status}, data: ${JSON.stringify(body)})`);
      failed++;
    }
  }

  console.log("==================================================");
  console.log(`Template Validation Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
