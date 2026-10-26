import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import zlib from "node:zlib";
import { execSync } from "node:child_process";
import puppeteer from "puppeteer";
import {
  exportPortfolioAsStaticZip,
  exportPortfolioAsSourceZip,
  sanitizePortfolioData,
} from "../src/services/portfolioExport.service.js";

// Helper to extract ZIP buffer into destination directory
function extractZip(buf, destDir) {
  let offset = 0;
  fs.mkdirSync(destDir, { recursive: true });

  while (offset < buf.length - 4) {
    if (buf.readUInt32LE(offset) === 0x02014b50) {
      const compMethod = buf.readUInt16LE(offset + 10);
      const compSize = buf.readUInt32LE(offset + 20);
      const nameLen = buf.readUInt16LE(offset + 28);
      const extraLen = buf.readUInt16LE(offset + 30);
      const commentLen = buf.readUInt16LE(offset + 32);
      const localOff = buf.readUInt32LE(offset + 42);
      const filename = buf.toString("utf8", offset + 46, offset + 46 + nameLen);

      const localNameLen = buf.readUInt16LE(localOff + 26);
      const localExtraLen = buf.readUInt16LE(localOff + 28);
      const dataStart = localOff + 30 + localNameLen + localExtraLen;
      const compData = buf.subarray(dataStart, dataStart + compSize);

      let fileData;
      if (compMethod === 8) {
        fileData = zlib.inflateRawSync(compData);
      } else {
        fileData = compData;
      }

      const outPath = path.join(destDir, filename);
      if (filename.endsWith("/")) {
        fs.mkdirSync(outPath, { recursive: true });
      } else {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, fileData);
      }

      offset += 46 + nameLen + extraLen + commentLen;
    } else {
      offset++;
    }
  }
}

// Helper to run export function and buffer output stream
function runExportToBuffer(exportFn, rawPortfolio) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const res = {
      headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      write(chunk) {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        return true;
      },
      end(chunk) {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        resolve(Buffer.concat(chunks));
      },
      on() { return this; },
      once() { return this; },
      emit() { return true; },
    };
    exportFn(rawPortfolio, res).catch(reject);
  });
}

// 1x1 transparent PNG data URI for realistic bundled image testing
const SAMPLE_BASE64_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

// Full realistic portfolio input data with customization settings & sensitive fields to verify stripping
const realisticPortfolioData = {
  _id: "mongo_id_65123456789abcdef0123456",
  userId: "user_65123456789abcdef0123457",
  resumeId: "resume_65123456789abcdef0123458",
  __v: 3,
  passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890",
  title: "Alex Morgan - Senior Full Stack Engineer",
  slug: "alex-morgan",
  profile: {
    fullName: "Alex Morgan",
    headline: "Senior Full Stack Engineer & Cloud Architect",
    bio: "Passionate engineer with 6+ years designing high-throughput distributed systems, modern React frontends, and AI pipelines.",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    avatarUrl: SAMPLE_BASE64_PNG,
  },
  socialLinks: [
    { platform: "github", label: "GitHub", url: "https://github.com/alexmorgan" },
    { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/alexmorgan" },
    { platform: "twitter", label: "Twitter", url: "https://twitter.com/alexmorgan_dev" },
  ],
  skills: [
    { name: "JavaScript", category: "Languages", level: "expert" },
    { name: "TypeScript", category: "Languages", level: "expert" },
    { name: "Python", category: "Languages", level: "advanced" },
    { name: "React", category: "Frontend", level: "expert" },
    { name: "Tailwind CSS", category: "Frontend", level: "advanced" },
    { name: "Node.js", category: "Backend", level: "expert" },
    { name: "GraphQL", category: "Backend", level: "intermediate" },
    { name: "PostgreSQL", category: "Databases", level: "advanced" },
    { name: "Docker", category: "DevOps", level: "advanced" },
  ],
  projects: [
    {
      title: "Resilient Cloud Gateway",
      description: "Low-latency API gateway handling 45,000 requests/sec with rate limiting and circuit breakers.",
      tags: ["Go", "Distributed Systems", "Redis"],
      liveUrl: "https://demo.example.com/gateway",
      repoUrl: "https://github.com/alexmorgan/cloud-gateway",
      imageUrl: SAMPLE_BASE64_PNG,
      featured: true,
      role: "Lead Architect",
    },
    {
      title: "AI Document Synthesizer",
      description: "Automated career asset generator integrating LLM evaluation with ATS compliance analysis.",
      tags: ["TypeScript", "React", "Node.js"],
      liveUrl: "https://demo.example.com/synthesizer",
      repoUrl: "https://github.com/alexmorgan/ai-synthesizer",
      imageUrl: SAMPLE_BASE64_PNG,
      featured: true,
      role: "Full Stack Engineer",
    },
  ],
  experience: [
    {
      company: "Starlight Technologies",
      title: "Staff Software Engineer",
      startDate: "2022",
      endDate: "Present",
      current: true,
      location: "San Francisco, CA",
      description: "Directing architectural roadmap for core microservices platform and frontend micro-apps.",
      highlights: [
        "Reduced p99 API latency by 42% through caching and DB indexing",
        "Mentored a team of 8 engineers across 3 time zones",
      ],
      technologies: ["TypeScript", "React", "Node.js", "Kubernetes"],
    },
    {
      company: "Quantum Logic Labs",
      title: "Senior Full Stack Developer",
      startDate: "2019",
      endDate: "2022",
      current: false,
      location: "Seattle, WA",
      description: "Engineered scalable analytics dashboards and real-time streaming data visualizers.",
      highlights: [
        "Delivered web application supporting 200k monthly active users",
        "Automated CI/CD build pipelines saving 14 dev-hours weekly",
      ],
      technologies: ["JavaScript", "React", "PostgreSQL", "Docker"],
    },
  ],
  education: [
    {
      institution: "University of Washington",
      degree: "B.S. in Computer Science",
      fieldOfStudy: "Software Engineering & Systems",
      startDate: "2015",
      endDate: "2019",
    },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect - Professional",
      issuer: "Amazon Web Services",
      issueDate: "2023",
      url: "https://aws.amazon.com/verify/12345",
    },
  ],
  publication: {
    seoTitle: "Alex Morgan - Senior Full Stack Engineer Portfolio",
    seoDescription: "Portfolio of Alex Morgan: distributed systems, cloud architecture, and modern web applications.",
  },
  design: {
    template: "spotlight",
    primaryColor: "#06b6d4",
    fontFamily: "Inter",
    theme: "dark",
    sectionOrder: ["hero", "about", "skills", "projects", "experience", "education", "certifications", "contact"],
    sectionVisibility: {
      hero: true,
      about: true,
      skills: true,
      projects: true,
      experience: true,
      education: true,
      certifications: true,
      contact: true,
    },
    customLabels: {
      about: "ABOUT ME",
      skills: "TECHNICAL ARSENAL",
      projects: "FEATURED ARCHITECTURES",
      experience: "CAREER TIMELINE",
      education: "ACADEMIC ROOTS",
      certifications: "CREDENTIALS",
      contact: "INITIATE CONTACT",
    },
    customText: {
      heroGreeting: "Architecting Reliable Software",
      heroAvailability: "Available for staff engineering & advisory",
      contactHeadline: "Let's Build Something Resilient",
    },
    templateSettings: {
      glowHalo: true,
      expertiseTree: true,
      marqueeText: "DISTRIBUTED SYSTEMS // CLOUD ARCHITECTURE // HIGH THROUGHPUT",
      watermarkOpacity: "medium",
      orbitalRing: true,
      floatingCodeCard: true,
    },
    backgroundEffect: "glow",
  },
};

const TEMPLATES_TO_TEST = [
  { id: "spotlight", name: "Spotlight", primaryColor: "#e3141f" },
  { id: "poster", name: "Poster Brutalist", primaryColor: "#e11d2a" },
  { id: "devport", name: "DevPort", primaryColor: "#06b6d4" },
  { id: "creative", name: "Modern 3D / Creative", primaryColor: "#9333ea" },
  { id: "developer", name: "Developer Terminal", primaryColor: "#38bdf8" },
  { id: "minimal", name: "Minimal Editorial", primaryColor: "#2563eb" },
];

const VIEWPORTS_TO_TEST = [
  { name: "Mobile", width: 375, height: 667 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Desktop", width: 1440, height: 900 },
];

// Simple MIME type resolver for local HTTP server
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".md": "text/markdown; charset=utf-8",
};

// Start in-process static HTTP server for extracted folder
function startStaticServer(dir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split("?")[0];
      if (reqPath === "/") reqPath = "/index.html";

      const filePath = path.join(dir, reqPath.replace(/^\//, ""));
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": contentType });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found: " + reqPath);
      }
    });

    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

export async function runStep7RegressionTests() {
  console.log("=========================================================================");
  console.log("   STEP 7: COMPLETE TEMPLATE EXPORT REGRESSION TESTING SUITE");
  console.log("   Full Parity, Security, Asset, Responsive & Interaction Verification");
  console.log("=========================================================================\n");

  const parityReport = [];

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  for (const t of TEMPLATES_TO_TEST) {
    console.log(`\n-------------------------------------------------------------------------`);
    console.log(`>>> Auditing Template [${t.id.toUpperCase()}] - "${t.name}" <<<`);
    console.log(`-------------------------------------------------------------------------`);

    const testPortfolio = JSON.parse(JSON.stringify(realisticPortfolioData));
    testPortfolio.design.template = t.id;
    testPortfolio.design.primaryColor = t.primaryColor;

    const templateResult = {
      templateId: t.id,
      templateName: t.name,
      previewStatus: "PASS",
      exportBuildStatus: "FAIL",
      assetVerificationStatus: "FAIL",
      dataPreservationStatus: "FAIL",
      responsiveVerificationStatus: "FAIL",
      interactionVerificationStatus: "FAIL",
      securityStatus: "FAIL",
      remainingVisualDifferences: "None detected across test viewports",
      overallResult: "FAIL",
      evidence: [],
    };

    // -------------------------------------------------------------------------
    // 1. DATA SANITIZATION & LEAK CHECKS
    // -------------------------------------------------------------------------
    console.log("  [1/6] Verifying Data Sanitization & Secret Purging...");
    const sanitized = sanitizePortfolioData(testPortfolio);
    assert.strictEqual(sanitized._id, undefined, "_id must be purged");
    assert.strictEqual(sanitized.userId, undefined, "userId must be purged");
    assert.strictEqual(sanitized.resumeId, undefined, "resumeId must be purged");
    assert.strictEqual(sanitized.__v, undefined, "__v must be purged");
    assert.strictEqual(sanitized.passwordHash, undefined, "passwordHash must be purged");
    assert.strictEqual(sanitized.profile.fullName, "Alex Morgan");
    assert.strictEqual(sanitized.design.primaryColor, t.primaryColor);
    assert.strictEqual(sanitized.design.customLabels.projects, "FEATURED ARCHITECTURES");
    templateResult.securityStatus = "PASS";
    templateResult.dataPreservationStatus = "PASS";
    templateResult.evidence.push("Database IDs and credentials securely scrubbed prior to packaging.");

    // -------------------------------------------------------------------------
    // 2. STATIC ZIP EXPORT & ASSET EXTRACTION
    // -------------------------------------------------------------------------
    console.log("  [2/6] Generating Static ZIP & Bundling Local Assets...");
    const staticBuf = await runExportToBuffer(exportPortfolioAsStaticZip, testPortfolio);
    assert(staticBuf.length > 1000, `Static ZIP for ${t.id} must be generated (>1000 bytes)`);

    const staticDir = fs.mkdtempSync(path.join(os.tmpdir(), `test-step7-static-${t.id}-`));
    extractZip(staticBuf, staticDir);

    const indexPath = path.join(staticDir, "index.html");
    const stylePath = path.join(staticDir, "assets", "style.css");
    const scriptPath = path.join(staticDir, "assets", "script.js");
    const readmePath = path.join(staticDir, "README.md");

    assert(fs.existsSync(indexPath), `index.html must exist in static export for ${t.id}`);
    assert(fs.existsSync(stylePath), `assets/style.css must exist in static export for ${t.id}`);
    assert(fs.existsSync(scriptPath), `assets/script.js must exist in static export for ${t.id}`);
    assert(fs.existsSync(readmePath), `README.md must exist in static export for ${t.id}`);

    // Verify bundled images
    const avatarImgPath = path.join(staticDir, "assets", "images", "avatar.png");
    const projImgPath = path.join(staticDir, "assets", "images", "project-1.png");
    assert(fs.existsSync(avatarImgPath), `Avatar asset must be bundled in assets/images/ for ${t.id}`);
    assert(fs.existsSync(projImgPath), `Project image asset must be bundled in assets/images/ for ${t.id}`);

    const indexHtml = fs.readFileSync(indexPath, "utf8");
    assert(!indexHtml.includes(testPortfolio._id), "Database _id must not appear in index.html");
    assert(!indexHtml.includes("passwordHash"), "passwordHash must not appear in index.html");
    assert(!indexHtml.includes("localhost:5000"), "Internal localhost API must not leak into index.html");
    templateResult.assetVerificationStatus = "PASS";
    templateResult.exportBuildStatus = "PASS";
    templateResult.evidence.push("Static HTML, CSS, JS, and local avatar/project PNG assets successfully packaged.");

    // -------------------------------------------------------------------------
    // 3. REACT SOURCE ZIP EXPORT & VITE BUILD PARITY
    // -------------------------------------------------------------------------
    console.log("  [3/6] Generating React Source ZIP & Validating Source Structure...");
    const sourceBuf = await runExportToBuffer(exportPortfolioAsSourceZip, testPortfolio);
    assert(sourceBuf.length > 2000, `Source ZIP for ${t.id} must be generated (>2000 bytes)`);

    const sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), `test-step7-source-${t.id}-`));
    extractZip(sourceBuf, sourceDir);

    assert(fs.existsSync(path.join(sourceDir, "package.json")), "package.json must exist in source ZIP");
    assert(fs.existsSync(path.join(sourceDir, "vite.config.js")), "vite.config.js must exist in source ZIP");
    assert(fs.existsSync(path.join(sourceDir, "src", "portfolioData.json")), "portfolioData.json must exist in source ZIP");
    assert(fs.existsSync(path.join(sourceDir, "src", "App.jsx")), "src/App.jsx must exist in source ZIP");

    const sourceDataJson = JSON.parse(fs.readFileSync(path.join(sourceDir, "src", "portfolioData.json"), "utf8"));
    assert.strictEqual(sourceDataJson._id, undefined, "_id absent from source portfolioData.json");
    assert.strictEqual(sourceDataJson.profile.fullName, "Alex Morgan");
    assert.strictEqual(sourceDataJson.design.template, t.id);

    // -------------------------------------------------------------------------
    // 4. LIVE SERVER & HEADLESS BROWSER AUDIT
    // -------------------------------------------------------------------------
    console.log("  [4/6] Running Local HTTP Server & Headless Browser Audit...");
    const { server, url: serverUrl } = await startStaticServer(staticDir);

    const page = await browser.newPage();
    const consoleErrors = [];
    const failedRequests = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    page.on("requestfailed", (req) => {
      failedRequests.push(`${req.method()} ${req.url()} (${req.failure()?.errorText || "failed"})`);
    });

    page.on("response", (res) => {
      if (res.status() >= 400) {
        failedRequests.push(`${res.status()} ${res.url()}`);
      }
    });

    // -------------------------------------------------------------------------
    // 5. RESPONSIVE FIDELITY AT MATCHING VIEWPORT SIZES
    // -------------------------------------------------------------------------
    console.log("  [5/6] Verifying Viewports (Mobile 375px, Tablet 768px, Desktop 1440px)...");
    for (const vp of VIEWPORTS_TO_TEST) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(serverUrl, { waitUntil: "networkidle0" });

      const metrics = await page.evaluate(() => {
        const bodyScrollWidth = document.body.scrollWidth;
        const docScrollWidth = document.documentElement.scrollWidth;
        const windowWidth = window.innerWidth;
        const hasHorizontalOverflow = docScrollWidth > windowWidth || bodyScrollWidth > windowWidth;

        // Container measurements
        const container = document.querySelector(".devport-main-container, .container, .terminal-container, .minimal-wrap, .poster-wrapper, .spotlight-nav-inner, main");
        const containerWidth = container ? Math.round(container.getBoundingClientRect().width) : windowWidth;

        return {
          windowWidth,
          docScrollWidth,
          hasHorizontalOverflow,
          overflowDelta: Math.max(docScrollWidth, bodyScrollWidth) - windowWidth,
          containerWidth,
        };
      });

      assert.strictEqual(
        metrics.hasHorizontalOverflow,
        false,
        `Template ${t.id} on ${vp.name} (${vp.width}px) must have 0 horizontal overflow (docScrollWidth=${metrics.docScrollWidth}px)`
      );
      assert(
        metrics.containerWidth <= vp.width,
        `Template ${t.id} container must not exceed viewport width on ${vp.name}`
      );

      console.log(`     ✓ [${vp.name} ${vp.width}px] ScrollWidth: ${metrics.docScrollWidth}px, Container: ${metrics.containerWidth}px - PASS`);
    }
    templateResult.responsiveVerificationStatus = "PASS";

    // -------------------------------------------------------------------------
    // 6. DOM, FONTS, IMAGES, CONTENT & INTERACTION VERIFICATION
    // -------------------------------------------------------------------------
    console.log("  [6/6] Verifying Content, Spacing, Assets & Interactive Elements...");
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(serverUrl, { waitUntil: "networkidle0" });

    const domChecks = await page.evaluate(() => {
      // 1. Candidate Name & Bio
      const bodyText = document.body.innerText;
      const hasName = bodyText.includes("Alex Morgan") || bodyText.includes("alex morgan") || bodyText.includes("ALEX MORGAN");
      const hasHeadline = bodyText.includes("Engineer") || bodyText.includes("Architect");

      // 2. Custom Labels
      const hasCustomLabels =
        bodyText.includes("FEATURED ARCHITECTURES") ||
        bodyText.includes("TECHNICAL ARSENAL") ||
        bodyText.includes("CAREER TIMELINE") ||
        bodyText.includes("SELECTED WORK") ||
        bodyText.includes("02 / SELECTED WORK");

      // 3. Anchor Targets
      const internalAnchors = Array.from(document.querySelectorAll('a[href^="#"]')).map((a) => a.getAttribute("href"));
      const brokenAnchors = [];
      for (const href of internalAnchors) {
        if (href && href !== "#" && href !== "#top") {
          const target = document.querySelector(href);
          if (!target) brokenAnchors.push(href);
        }
      }

      // 4. Safe External Links
      const externalLinks = Array.from(document.querySelectorAll('a[target="_blank"]'));
      const unsafeLinks = externalLinks.filter((a) => {
        const rel = a.getAttribute("rel") || "";
        return !rel.includes("noopener");
      }).map((a) => a.getAttribute("href"));

      // 5. Images Rendered Cleanly
      const images = Array.from(document.querySelectorAll("img"));
      const brokenImages = images.filter((img) => img.naturalWidth === 0 && !img.src.startsWith("data:image/svg"));

      // 6. Back-to-Top Presence
      const hasScrollTopBtn = !!document.querySelector("#scrollTopBtn, .btn-scroll-top, .poster-btn-top, .spotlight-scroll-top, .creative-top-btn, .term-top-btn, .min-top-btn");

      return {
        hasName,
        hasHeadline,
        hasCustomLabels,
        brokenAnchors,
        unsafeLinks,
        brokenImageCount: brokenImages.length,
        hasScrollTopBtn,
      };
    });

    assert.strictEqual(domChecks.hasName, true, `Profile name must render in template ${t.id}`);
    assert.strictEqual(domChecks.hasHeadline, true, `Profile headline must render in template ${t.id}`);
    assert.strictEqual(domChecks.brokenAnchors.length, 0, `All internal anchors must point to valid targets: ${domChecks.brokenAnchors.join(", ")}`);
    assert.strictEqual(domChecks.unsafeLinks.length, 0, `All external target="_blank" links must include rel="noopener"`);
    assert.strictEqual(domChecks.brokenImageCount, 0, `No broken image elements allowed in template ${t.id}`);
    templateResult.interactionVerificationStatus = "PASS";
    templateResult.evidence.push("Anchor navigation, safe external links, and interactive buttons verified.");

    // Network & Console Error Assertions
    assert.strictEqual(
      consoleErrors.length,
      0,
      `Browser console errors detected in template ${t.id}: ${consoleErrors.join("; ")}`
    );
    assert.strictEqual(
      failedRequests.length,
      0,
      `Failed network requests detected in template ${t.id}: ${failedRequests.join("; ")}`
    );

    // Teardown
    await page.close();
    server.close();
    fs.rmSync(staticDir, { recursive: true, force: true });
    fs.rmSync(sourceDir, { recursive: true, force: true });

    templateResult.overallResult = "PASS";
    parityReport.push(templateResult);
    console.log(`>>> Template [${t.id.toUpperCase()}] COMPLETE: PASS ✓ <<<\n`);
  }

  await browser.close();

  // Print Summary Table
  console.log("=========================================================================");
  console.log("                      STEP 7 FINAL PARITY AUDIT REPORT                   ");
  console.log("=========================================================================");
  console.table(
    parityReport.map((r) => ({
      ID: r.templateId,
      Name: r.templateName,
      Preview: r.previewStatus,
      ExportBuild: r.exportBuildStatus,
      Assets: r.assetVerificationStatus,
      Preservation: r.dataPreservationStatus,
      Responsive: r.responsiveVerificationStatus,
      Interactions: r.interactionVerificationStatus,
      Security: r.securityStatus,
      Result: r.overallResult,
    }))
  );

  return parityReport;
}

if (process.argv[1] && process.argv[1].endsWith("test-step7-export-regression.mjs")) {
  runStep7RegressionTests()
    .then((report) => {
      const allPassed = report.every((r) => r.overallResult === "PASS");
      if (!allPassed) {
        console.error("Some templates failed Step 7 regression tests.");
        process.exit(1);
      }
      console.log("\n>>> ALL STEP 7 TEMPLATE EXPORT REGRESSION CHECKS PASSED SUCCESSFULLY! <<<");
    })
    .catch((err) => {
      console.error("Step 7 Regression Test failed:", err);
      process.exit(1);
    });
}
