import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BASE = "http://localhost:5001/api";
const SCRATCH_DIR = path.resolve("./scratch/export-verification");

console.log("==========================================================================");
console.log("  Portfolio Export Suite: React Source & Static Website Verification       ");
console.log("==========================================================================\n");

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    process.stdout.write(`  [EXPORT TEST] ${name} ... `);
    await fn();
    console.log("✅ PASS");
    passed++;
  } catch (err) {
    console.log("❌ FAIL");
    console.error(`        Error: ${err.message}`);
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

async function createPortfolio(cookie, payload) {
  const res = await fetch(`${BASE}/portfolios`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  assert.equal(res.status, 201, `Failed to create portfolio (${res.status}): ${text}`);
  const data = JSON.parse(text);
  return data.data.portfolio;
}


// Clean up scratch dir
if (fs.existsSync(SCRATCH_DIR)) {
  fs.rmSync(SCRATCH_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SCRATCH_DIR, { recursive: true });

async function run() {
  const timestamp = Date.now();
  const userA = await registerUser("Alice Exporter", `alice.export.${timestamp}@example.com`, "ExportPassword!123");
  const userB = await registerUser("Bob Hacker", `bob.export.${timestamp}@example.com`, "ExportPassword!123");

  const templatesToTest = ["devport", "creative", "developer", "minimal"];

  for (const tpl of templatesToTest) {
    await test(`Create test portfolio with template '${tpl}'`, async () => {
      const p = await createPortfolio(userA.cookie, {
        title: `Alice ${tpl.toUpperCase()} Portfolio`,
        slug: `alice-${tpl}-${timestamp}`,
        profile: {
          fullName: `Alice Walker (${tpl})`,
          headline: `Senior Software Engineer specializing in ${tpl}`,
          bio: `Passionate engineer creating modern digital experiences with scalable architecture.`,
          email: "alice@example.com",
          location: "San Francisco, CA",
        },
        skills: [
          { name: "React", category: "Frontend", level: "expert" },
          { name: "Node.js", category: "Backend", level: "advanced" },
          { name: "TypeScript", category: "Languages", level: "expert" },
        ],
        projects: [
          {
            title: "Cloud Orchestrator",
            description: "High-performance distributed systems dashboard.",
            tags: ["React", "Go", "Docker"],
            liveUrl: "https://cloud.example.com",
            repoUrl: "https://github.com/alice/cloud",
            featured: true,
          },
        ],
        experience: [
          {
            title: "Staff Engineer",
            company: "Tech Corp",
            startDate: "2022",
            endDate: "Present",
            current: true,
            description: "Led core infrastructure.",
            highlights: ["Architected microservices", "Improved performance by 40%"],
          },
        ],
        design: {
          template: tpl,
          primaryColor: "#38bdf8",
        },
      });

      // 1. Download React Source ZIP
      const sourceRes = await fetch(`${BASE}/portfolios/${p._id}/export?format=source`, {
        headers: { cookie: userA.cookie },
      });
      assert.equal(sourceRes.status, 200, "Source export should return 200 OK");
      assert.match(sourceRes.headers.get("content-type") || "", /application\/zip/, "Content-Type must be application/zip");
      const sourceDisposition = sourceRes.headers.get("content-disposition") || "";
      assert.match(sourceDisposition, /attachment;/, "Content-Disposition must be attachment");
      assert.match(sourceDisposition, /-react-source\.zip/, "Filename must indicate react-source.zip");

      const sourceBuf = Buffer.from(await sourceRes.arrayBuffer());
      assert(sourceBuf.length > 500, "Source ZIP should contain substantial bytes");

      const sourceZipPath = path.join(SCRATCH_DIR, `${tpl}-source.zip`);
      const sourceExtractDir = path.join(SCRATCH_DIR, `${tpl}-source`);
      fs.writeFileSync(sourceZipPath, sourceBuf);

      // Extract using tar or powershell
      fs.mkdirSync(sourceExtractDir, { recursive: true });
      execSync(`tar -xf "${sourceZipPath}" -C "${sourceExtractDir}"`, { stdio: "pipe" });

      // Verify files in Source ZIP
      const requiredSourceFiles = [
        "package.json",
        "vite.config.js",
        "index.html",
        "README.md",
        "LICENSE",
        "src/main.jsx",
        "src/App.jsx",
        "src/index.css",
        "src/portfolioData.json",
        "src/components/common/BrandIcon.jsx",
        "src/components/common/SafeLink.jsx",
        "src/components/common/urlUtils.js",
        "src/components/templates/DevPortTemplate.jsx",
      ];
      for (const reqFile of requiredSourceFiles) {
        assert(fs.existsSync(path.join(sourceExtractDir, reqFile)), `Missing file: ${reqFile}`);
      }

      // Verify sanitized data (no userId or passwords)
      const dataJson = JSON.parse(fs.readFileSync(path.join(sourceExtractDir, "src/portfolioData.json"), "utf8"));
      assert.equal(dataJson.profile.fullName, `Alice Walker (${tpl})`);
      assert.equal(dataJson.userId, undefined, "userId must be omitted from export");
      assert.equal(dataJson.__v, undefined, "__v must be omitted from export");

      // 2. Download Static Website ZIP
      const staticRes = await fetch(`${BASE}/portfolios/${p._id}/export?format=static`, {
        headers: { cookie: userA.cookie },
      });
      assert.equal(staticRes.status, 200, "Static export should return 200 OK");
      assert.match(staticRes.headers.get("content-type") || "", /application\/zip/, "Content-Type must be application/zip");
      const staticDisposition = staticRes.headers.get("content-disposition") || "";
      assert.match(staticDisposition, /-static-website\.zip/, "Filename must indicate static-website.zip");

      const staticBuf = Buffer.from(await staticRes.arrayBuffer());
      assert(staticBuf.length > 500, "Static ZIP should contain substantial bytes");

      const staticZipPath = path.join(SCRATCH_DIR, `${tpl}-static.zip`);
      const staticExtractDir = path.join(SCRATCH_DIR, `${tpl}-static`);
      fs.writeFileSync(staticZipPath, staticBuf);

      fs.mkdirSync(staticExtractDir, { recursive: true });
      execSync(`tar -xf "${staticZipPath}" -C "${staticExtractDir}"`, { stdio: "pipe" });

      // Verify files in Static ZIP
      assert(fs.existsSync(path.join(staticExtractDir, "index.html")), "Missing index.html in static export");
      assert(fs.existsSync(path.join(staticExtractDir, "assets/style.css")), "Missing assets/style.css in static export");
      assert(fs.existsSync(path.join(staticExtractDir, "assets/script.js")), "Missing assets/script.js in static export");
      assert(fs.existsSync(path.join(staticExtractDir, "README.md")), "Missing README.md in static export");

      // Verify Static HTML content
      const staticHtml = fs.readFileSync(path.join(staticExtractDir, "index.html"), "utf8");
      assert(staticHtml.includes(`Alice Walker (${tpl})`), "HTML must contain portfolio owner name");
      assert(staticHtml.includes("Cloud Orchestrator"), "HTML must contain project title");
      assert(staticHtml.includes("React"), "HTML must contain skill name");
      assert(!staticHtml.includes("localhost:5001"), "Static site must have zero calls to backend localhost");
      assert(!staticHtml.includes("/api/portfolios"), "Static site must have zero API dependencies");
    });
  }

  // Security checks
  await test("Security Audit: User B cannot export User A's portfolio (404)", async () => {
    const pA = await createPortfolio(userA.cookie, {
      title: "Secret Portfolio",
      slug: `secret-alice-${timestamp}`,
      profile: { fullName: "Secret Alice" },
    });

    const unauthorizedRes = await fetch(`${BASE}/portfolios/${pA._id}/export?format=source`, {
      headers: { cookie: userB.cookie },
    });
    assert.equal(unauthorizedRes.status, 404, "Cross-user export should return 404 Not Found");
  });

  await test("Security Audit: Unauthenticated request to export returns 401", async () => {
    const unauthRes = await fetch(`${BASE}/portfolios/some-arbitrary-id/export?format=static`);
    assert.equal(unauthRes.status, 401, "Unauthenticated export must return 401");
  });

  // Verify that an extracted React source builds successfully with Vite
  await test("Build Verification: React source bundle builds successfully with Vite", async () => {
    const devportExtractDir = path.join(SCRATCH_DIR, "devport-source");
    const clientNodeModules = path.resolve(import.meta.dirname, "../../client/node_modules");

    // Link client node_modules so Vite can resolve dependencies without a 5-minute npm download
    const destNodeModules = path.join(devportExtractDir, "node_modules");
    if (!fs.existsSync(destNodeModules)) {
      execSync(`cmd /c mklink /J "${destNodeModules}" "${clientNodeModules}"`, { stdio: "pipe" });
    }

    // Run npx vite build
    const buildResult = execSync(`npx vite build`, {
      cwd: devportExtractDir,
      encoding: "utf8",
    });
    assert(fs.existsSync(path.join(devportExtractDir, "dist/index.html")), "Vite build must generate dist/index.html");
    assert(buildResult.includes("built in") || buildResult.includes("dist/"), "Build output should indicate completion");
  });

  console.log("\n==========================================================================");
  console.log(`  Export Test Suite Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Master test runner error:", err);
  process.exit(1);
});
