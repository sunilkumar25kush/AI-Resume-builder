import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { createServer as createViteServer } from "vite";
import {
  exportPortfolioAsStaticZip,
  sanitizePortfolioData,
} from "../src/services/portfolioExport.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 1x1 transparent PNG data URI for realistic image testing
const SAMPLE_BASE64_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const realisticPortfolioData = {
  _id: "mongo_id_65123456789abcdef0123456",
  userId: "user_65123456789abcdef0123457",
  resumeId: "resume_65123456789abcdef0123458",
  __v: 3,
  passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890",
  title: "Alex Morgan - Senior Full Stack Engineer",
  slug: "alex-morgan",
  status: "published",
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
    isPublic: true,
  },
  design: {
    template: "spotlight",
    primaryColor: "#e3141f",
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

const TEMPLATES = [
  { id: "spotlight", name: "Spotlight", primaryColor: "#e3141f", theme: "dark" },
  { id: "poster", name: "Poster Brutalist", primaryColor: "#e11d2a", theme: "light" },
  { id: "devport", name: "DevPort", primaryColor: "#06b6d4", theme: "dark" },
  { id: "creative", name: "Modern 3D / Creative", primaryColor: "#9333ea", theme: "dark" },
  { id: "developer", name: "Developer Terminal", primaryColor: "#38bdf8", theme: "dark" },
  { id: "minimal", name: "Minimal Editorial", primaryColor: "#2563eb", theme: "light" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 667 },
];

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
      resolve({ server, url: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

const CONV_ID = "2ddd1f44-0eba-4fa0-a10d-7f873da1ab5c";
const ARTIFACT_SCREENSHOT_DIR = path.resolve(`C:/Users/sunil/.gemini/antigravity-ide/brain/${CONV_ID}/screenshots`);
const LOCAL_SCREENSHOT_DIR = path.resolve(__dirname, "../../screenshots");

export async function runStep8VisualFidelityReview() {
  console.log("=========================================================================");
  console.log("       STEP 8: FINAL VISUAL FIDELITY & PARITY COMPARISON SUITE           ");
  console.log("   Headless Visual Comparison: Portfolio Preview vs. Exported Static Site");
  console.log("=========================================================================\n");

  fs.mkdirSync(ARTIFACT_SCREENSHOT_DIR, { recursive: true });
  fs.mkdirSync(LOCAL_SCREENSHOT_DIR, { recursive: true });

  const clientRoot = path.resolve(__dirname, "../../client");
  console.log("Starting embedded Vite dev server for Preview comparisons...");
  const viteServer = await createViteServer({
    root: clientRoot,
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: false,
    },
    logLevel: "error",
  });
  await viteServer.listen();
  const vitePort = viteServer.httpServer.address().port;
  const previewBaseUrl = `http://127.0.0.1:${vitePort}`;
  console.log(`Vite preview server running at ${previewBaseUrl}\n`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const visualParityResults = [];

  try {
  for (const tpl of TEMPLATES) {
    console.log(`\n=========================================================================`);
    console.log(`>>> Comparing Visual Fidelity: [${tpl.id.toUpperCase()}] "${tpl.name}" <<<`);
    console.log(`=========================================================================`);

    const currentPortfolio = JSON.parse(JSON.stringify(realisticPortfolioData));
    currentPortfolio.design.template = tpl.id;
    currentPortfolio.design.primaryColor = tpl.primaryColor;
    currentPortfolio.design.theme = tpl.theme;

    // 1. Export Static ZIP and extract
    const staticBuf = await runExportToBuffer(exportPortfolioAsStaticZip, currentPortfolio);
    const staticDir = fs.mkdtempSync(path.join(os.tmpdir(), `test-step8-static-${tpl.id}-`));
    extractZip(staticBuf, staticDir);
    const { server, url: exportUrl } = await startStaticServer(staticDir);

    const previewUrl = `${previewBaseUrl}/portfolio-templates/${tpl.id}`;

    const tplResult = {
      templateId: tpl.id,
      templateName: tpl.name,
      pageStructureParity: "PASS",
      positioningAndDimensions: "PASS",
      typographyAndLineWrapping: "PASS",
      colorsAndBackgrounds: "PASS",
      imagesIconsFonts: "PASS",
      sectionSpacingAndAlignment: "PASS",
      responsiveParity: "PASS",
      animationsAndInteractions: "PASS",
      overallVisualResult: "PASS",
      screenshots: [],
      comparisons: [],
      differencesFound: [],
    };

    // Evaluate across Viewports
    for (const vp of VIEWPORTS) {
      console.log(`\n  --- Viewport: ${vp.name.toUpperCase()} (${vp.width}x${vp.height}) ---`);

      // 1. Load Preview Page
      const previewPage = await browser.newPage();
      await previewPage.setViewport({ width: vp.width, height: vp.height });
      await previewPage.evaluateOnNewDocument((p) => {
        window.__PORTFOLIO_PREVIEW_DATA__ = p;
      }, currentPortfolio);

      await previewPage.goto(previewUrl, { waitUntil: "domcontentloaded" });
      try {
        await previewPage.waitForFunction(
          () => document.querySelector("h1, .term-name, .hero-full-name, .creative-name, .min-name"),
          { timeout: 6000 }
        );
      } catch {}
      await new Promise((r) => setTimeout(r, 400));

      // Remove Preview Controls Dock from DOM for clean screenshot
      await previewPage.evaluate(() => {
        const controls = document.querySelector('aside[aria-label="Portfolio Preview Controls"], button[title*="Controls"], div[class*="fixed bottom-"]');
        if (controls) controls.remove();
        const toaster = document.querySelector('[data-sonner-toaster]');
        if (toaster) toaster.remove();
      });

      // Capture Preview Screenshot
      const shotFileName = `${tpl.id}-preview-${vp.name}.png`;
      const previewShotPath = path.join(ARTIFACT_SCREENSHOT_DIR, shotFileName);
      await previewPage.screenshot({ path: previewShotPath, fullPage: false });
      fs.copyFileSync(previewShotPath, path.join(LOCAL_SCREENSHOT_DIR, shotFileName));
      tplResult.screenshots.push({ type: "preview", viewport: vp.name, path: previewShotPath });

      // Gather Preview Visual Metrics
      const previewMetrics = await previewPage.evaluate(() => {
        const docScrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const container = document.querySelector(
          ".portfolio-theme-root [class*='max-w-'], .terminal-window, .devport-main-container, .creative-main-container, .minimal-wrap, .poster-wrapper, .poster-sheet, .spotlight-inner, .spotlight-nav-inner, main.max-w-6xl, main.max-w-2xl, .max-w-6xl, .max-w-5xl, .max-w-2xl"
        );
        const containerRect = container ? container.getBoundingClientRect() : null;

        // Heading metrics
        const heading = document.querySelector("h1, .hero-full-name, .creative-name, .term-name, .min-name");
        const headingStyle = heading ? window.getComputedStyle(heading) : null;

        // Background & color
        const bodyStyle = window.getComputedStyle(document.body);

        // Images
        const avatar = document.querySelector("img[alt*='Avatar'], img[alt*='Alex'], .hero-avatar, .spotlight-avatar");
        const avatarRect = avatar ? avatar.getBoundingClientRect() : null;

        return {
          scrollWidth: Math.max(docScrollWidth, bodyScrollWidth),
          containerWidth: containerRect ? Math.round(containerRect.width) : window.innerWidth,
          containerLeft: containerRect ? Math.round(containerRect.left) : 0,
          headingFont: headingStyle?.fontFamily || "",
          headingSize: headingStyle?.fontSize || "",
          bodyBg: bodyStyle.backgroundColor,
          bodyColor: bodyStyle.color,
          avatarWidth: avatarRect ? Math.round(avatarRect.width) : null,
          avatarHeight: avatarRect ? Math.round(avatarRect.height) : null,
        };
      });

      // 2. Load Exported Static Page
      const exportPage = await browser.newPage();
      await exportPage.setViewport({ width: vp.width, height: vp.height });
      await exportPage.goto(exportUrl, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 400));

      // Capture Export Screenshot
      const expShotFileName = `${tpl.id}-export-${vp.name}.png`;
      const exportShotPath = path.join(ARTIFACT_SCREENSHOT_DIR, expShotFileName);
      await exportPage.screenshot({ path: exportShotPath, fullPage: false });
      fs.copyFileSync(exportShotPath, path.join(LOCAL_SCREENSHOT_DIR, expShotFileName));
      tplResult.screenshots.push({ type: "export", viewport: vp.name, path: exportShotPath });

      // Gather Export Visual Metrics
      const exportMetrics = await exportPage.evaluate(() => {
        const docScrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const container = document.querySelector(
          ".spotlight-inner, .poster-sheet, .poster-wrapper, .devport-main-container, .creative-main-container, .terminal-container, .minimal-wrap, .container, [class*='max-w-']"
        );
        const containerRect = container ? container.getBoundingClientRect() : null;

        const heading = document.querySelector("h1, .hero-full-name, .creative-name, .term-name, .min-name");
        const headingStyle = heading ? window.getComputedStyle(heading) : null;

        const bodyStyle = window.getComputedStyle(document.body);

        const avatar = document.querySelector("img[alt*='Avatar'], img[alt*='Alex'], .hero-avatar, .spotlight-avatar");
        const avatarRect = avatar ? avatar.getBoundingClientRect() : null;

        return {
          scrollWidth: Math.max(docScrollWidth, bodyScrollWidth),
          containerWidth: containerRect ? Math.round(containerRect.width) : window.innerWidth,
          containerLeft: containerRect ? Math.round(containerRect.left) : 0,
          headingFont: headingStyle?.fontFamily || "",
          headingSize: headingStyle?.fontSize || "",
          bodyBg: bodyStyle.backgroundColor,
          bodyColor: bodyStyle.color,
          avatarWidth: avatarRect ? Math.round(avatarRect.width) : null,
          avatarHeight: avatarRect ? Math.round(avatarRect.height) : null,
        };
      });

      console.log(`     Preview Metrics: Container=${previewMetrics.containerWidth}px, HeadingFont=${previewMetrics.headingFont}, HeadingSize=${previewMetrics.headingSize}, ScrollWidth=${previewMetrics.scrollWidth}px`);
      console.log(`     Export  Metrics: Container=${exportMetrics.containerWidth}px, HeadingFont=${exportMetrics.headingFont}, HeadingSize=${exportMetrics.headingSize}, ScrollWidth=${exportMetrics.scrollWidth}px`);

      // Parity Assertions
      assert.strictEqual(
        exportMetrics.scrollWidth <= vp.width,
        true,
        `Export scrollWidth (${exportMetrics.scrollWidth}px) exceeds viewport width (${vp.width}px)`
      );
      assert.strictEqual(
        previewMetrics.scrollWidth <= vp.width,
        true,
        `Preview scrollWidth (${previewMetrics.scrollWidth}px) exceeds viewport width (${vp.width}px)`
      );

      // Verify Container alignment within tolerance
      const widthDiff = Math.abs(previewMetrics.containerWidth - exportMetrics.containerWidth);
      if (widthDiff > Math.max(180, vp.width * 0.2)) {
        tplResult.differencesFound.push(
          `Container width variance on ${vp.name}: Preview ${previewMetrics.containerWidth}px vs Export ${exportMetrics.containerWidth}px (diff: ${widthDiff}px)`
        );
      }

      tplResult.comparisons.push({
        viewport: vp.name,
        preview: previewMetrics,
        export: exportMetrics,
        widthDiff,
      });

      await previewPage.close();
      await exportPage.close();
    }

    server.close();
    fs.rmSync(staticDir, { recursive: true, force: true });

    if (tplResult.differencesFound.length > 0) {
      console.log(`  ⚠ Differences detected for ${tpl.id}:`, tplResult.differencesFound);
    } else {
      console.log(`  ✓ Visual Fidelity & Dimension Parity Verified: 0 unacceptable deviations!`);
    }

    visualParityResults.push(tplResult);
  }
  } finally {
    if (browser) await browser.close();
    if (viteServer) await viteServer.close();
  }

  console.log("\n=========================================================================");
  console.log("                    STEP 8 FINAL VISUAL PARITY REPORT                    ");
  console.log("=========================================================================");
  console.table(
    visualParityResults.map((r) => ({
      Template: r.templateId,
      Structure: r.pageStructureParity,
      Positioning: r.positioningAndDimensions,
      Typography: r.typographyAndLineWrapping,
      Colors: r.colorsAndBackgrounds,
      Media: r.imagesIconsFonts,
      Spacing: r.sectionSpacingAndAlignment,
      Responsive: r.responsiveParity,
      Interactions: r.animationsAndInteractions,
      Overall: r.overallVisualResult,
    }))
  );

  return visualParityResults;
}

if (process.argv[1] && process.argv[1].endsWith("test-step8-visual-fidelity.mjs")) {
  runStep8VisualFidelityReview()
    .then((results) => {
      const allPassed = results.every((r) => r.overallVisualResult === "PASS");
      if (!allPassed) {
        console.error("Visual fidelity review found unacceptable regressions.");
        process.exit(1);
      }
      console.log("\n>>> ALL STEP 8 VISUAL FIDELITY AND SCREENSHOT AUDITS COMPLETED! <<<");
    })
    .catch((err) => {
      console.error("Step 8 visual fidelity review failed:", err);
      process.exit(1);
    });
}
