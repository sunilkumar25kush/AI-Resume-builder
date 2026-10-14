import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BASE = "http://localhost:5001/api";
const SCRATCH_DIR = path.resolve("./scratch/design-verification");

if (fs.existsSync(SCRATCH_DIR)) {
  fs.rmSync(SCRATCH_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SCRATCH_DIR, { recursive: true });

async function run() {
  console.log("Testing design options propagation to DevPort export...");

  // 1. Register user
  const email = `designer.${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Designer Dan", email, password: "Password123!" }),
  });
  assert.equal(regRes.status, 201);
  const cookie = (regRes.headers.getSetCookie?.() || [regRes.headers.get("set-cookie") || ""])[0].split(";")[0];

  // 2. Create DevPort portfolio with custom color (#ec4899), light theme, and Playfair font
  const createRes = await fetch(`${BASE}/portfolios`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({
      title: "DevPort Design Customization Portfolio",
      slug: `devport-custom-${Date.now()}`,
      profile: {
        fullName: "Dan The Designer",
        headline: "Principal Interface Engineer",
        bio: "Specializing in aesthetic digital craft.",
      },
      design: {
        template: "devport",
        primaryColor: "#ec4899",
        theme: "light",
        fontFamily: "Playfair",
      },
    }),
  });
  const createData = await createRes.json();
  const portfolioId = createData.data.portfolio._id;
  assert(portfolioId, "Portfolio ID should exist");

  // 3. Download Static ZIP and test
  const staticRes = await fetch(`${BASE}/portfolios/${portfolioId}/export?format=static`, {
    headers: { cookie },
  });
  assert.equal(staticRes.status, 200);
  const staticZipPath = path.join(SCRATCH_DIR, "static.zip");
  const staticExtractDir = path.join(SCRATCH_DIR, "static-extracted");
  fs.writeFileSync(staticZipPath, Buffer.from(await staticRes.arrayBuffer()));
  fs.mkdirSync(staticExtractDir, { recursive: true });
  execSync(`tar -xf "${staticZipPath}" -C "${staticExtractDir}"`);

  // Verify static HTML
  const staticHtml = fs.readFileSync(path.join(staticExtractDir, "index.html"), "utf8");
  assert(staticHtml.includes("devport-light"), "Static HTML body should have devport-light class for light theme");
  assert(staticHtml.includes("fonts.googleapis.com"), "Static HTML must include Google Fonts link");
  assert(staticHtml.includes("Playfair+Display"), "Static HTML Google Fonts link must include Playfair Display");

  // Verify static CSS
  const staticCss = fs.readFileSync(path.join(staticExtractDir, "assets/style.css"), "utf8");
  assert(staticCss.includes("#ec4899"), "Static CSS must contain custom primaryColor #ec4899");
  assert(staticCss.includes("'Playfair Display'"), "Static CSS must contain 'Playfair Display' font family");
  assert(staticCss.includes(".devport-light"), "Static CSS must contain .devport-light theme rules");
  console.log("  [PASS] Static Website export correctly contains primaryColor, light theme, and Playfair font");

  // 4. Download Source ZIP and test
  const sourceRes = await fetch(`${BASE}/portfolios/${portfolioId}/export?format=source`, {
    headers: { cookie },
  });
  assert.equal(sourceRes.status, 200);
  const sourceZipPath = path.join(SCRATCH_DIR, "source.zip");
  const sourceExtractDir = path.join(SCRATCH_DIR, "source-extracted");
  fs.writeFileSync(sourceZipPath, Buffer.from(await sourceRes.arrayBuffer()));
  fs.mkdirSync(sourceExtractDir, { recursive: true });
  execSync(`tar -xf "${sourceZipPath}" -C "${sourceExtractDir}"`);

  // Verify source files
  const sourceHtml = fs.readFileSync(path.join(sourceExtractDir, "index.html"), "utf8");
  assert(sourceHtml.includes("fonts.googleapis.com"), "Source index.html must include Google Fonts link");
  assert(sourceHtml.includes("Playfair+Display"), "Source index.html must load Playfair Display");
  assert(sourceHtml.includes("bg-[#f8fafc]"), "Source index.html body must have light theme background");

  const sourceCss = fs.readFileSync(path.join(sourceExtractDir, "src/index.css"), "utf8");
  assert(sourceCss.includes("'Playfair Display'"), "Source src/index.css must apply 'Playfair Display' to html");

  const sourceData = JSON.parse(fs.readFileSync(path.join(sourceExtractDir, "src/portfolioData.json"), "utf8"));
  assert.equal(sourceData.design.primaryColor, "#ec4899");
  assert.equal(sourceData.design.theme, "light");
  assert.equal(sourceData.design.fontFamily, "Playfair");
  assert.equal(sourceData.design.template, "devport");

  const devPortJsx = fs.readFileSync(path.join(sourceExtractDir, "src/components/templates/DevPortTemplate.jsx"), "utf8");
  assert(devPortJsx.includes("portfolio?.design?.primaryColor"), "DevPortTemplate.jsx must read dynamic primaryColor");
  assert(devPortJsx.includes("isLight"), "DevPortTemplate.jsx must support light theme");
  console.log("  [PASS] React Source export correctly contains primaryColor, light theme, Playfair font, and dynamic DevPortTemplate");

  // Test build of exported source
  const clientNodeModules = path.resolve(import.meta.dirname, "../../client/node_modules");
  const destNodeModules = path.join(sourceExtractDir, "node_modules");
  execSync(`cmd /c mklink /J "${destNodeModules}" "${clientNodeModules}"`, { stdio: "pipe" });
  execSync(`npx vite build`, { cwd: sourceExtractDir, stdio: "pipe" });
  assert(fs.existsSync(path.join(sourceExtractDir, "dist/index.html")), "Vite build must generate dist/index.html");
  console.log("  [PASS] React source with custom devport design builds cleanly with Vite");

  console.log("\nALL DESIGN PROPAGATION VERIFICATIONS PASSED SUCCESSFULLY!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
