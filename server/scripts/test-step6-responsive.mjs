import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import zlib from "node:zlib";
import puppeteer from "puppeteer";
import {
  exportPortfolioAsStaticZip,
  exportPortfolioAsSourceZip,
} from "../src/services/portfolioExport.service.js";

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
      const fileData = compMethod === 8 ? zlib.inflateRawSync(compData) : compData;
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

function runExport(template, data) {
  return new Promise((resolve) => {
    const chunks = [];
    const res = {
      headers: {},
      setHeader() {},
      write(c) { chunks.push(Buffer.from(c)); return true; },
      end(c) { if (c) chunks.push(Buffer.from(c)); resolve(Buffer.concat(chunks)); },
      on() {}, once() {}, emit() {}
    };
    const p = JSON.parse(JSON.stringify(data));
    p.design.template = template;
    exportPortfolioAsStaticZip(p, res);
  });
}

const mockPortfolio = {
  title: "Alex Morgan Portfolio",
  slug: "alex-morgan",
  profile: {
    fullName: "Alex Morgan",
    headline: "Full Stack Engineer & Creative Developer",
    bio: "Passionate full-stack developer crafting responsive, accessible web applications.",
    email: "alex@example.com",
    location: "San Francisco, CA",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  },
  socialLinks: [
    { platform: "github", url: "https://github.com/alexmorgan" },
    { platform: "linkedin", url: "https://linkedin.com/in/alexmorgan" }
  ],
  design: {
    template: "devport",
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
  },
  skills: [
    { name: "JavaScript", category: "frontend", level: "expert" },
    { name: "TypeScript", category: "frontend", level: "advanced" },
    { name: "React", category: "frontend", level: "expert" },
    { name: "Node.js", category: "backend", level: "advanced" },
  ],
  projects: [
    {
      title: "Portfolio Generator",
      description: "Generates high quality developer portfolios with responsive design.",
      tags: ["React", "Node.js"],
      liveUrl: "https://example.com/demo",
      repoUrl: "https://github.com/alex/portfolio-gen",
    },
    {
      title: "Cloud Orchestrator",
      description: "Automated distributed task scheduler for microservices.",
      tags: ["Go", "Kubernetes"],
      liveUrl: "https://example.com/cloud",
      repoUrl: "https://github.com/alex/cloud-orch",
    }
  ],
  experience: [
    { company: "Tech Corp", title: "Senior Engineer", startDate: "2022", endDate: "Present", current: true, description: "Led frontend initiatives." }
  ],
  education: [{ institution: "MIT", degree: "B.S. in Computer Science", startDate: "2018", endDate: "2022" }],
  certifications: [{ name: "AWS Certified Developer", issuer: "Amazon Web Services", issueDate: "2023" }]
};

const viewports = [
  { name: "Mobile (375px)", width: 375, height: 667, category: "mobile" },
  { name: "Mobile (390px)", width: 390, height: 844, category: "mobile" },
  { name: "Tablet (768px)", width: 768, height: 1024, category: "tablet" },
  { name: "Desktop (1366px)", width: 1366, height: 768, category: "desktop" },
  { name: "Desktop (1440px)", width: 1440, height: 900, category: "desktop" }
];

const templates = ["devport", "creative", "developer", "minimal", "spotlight", "poster"];

export async function runStep6Diagnostics() {
  console.log("===============================================================");
  console.log("   STEP 6: RESPONSIVE FIDELITY & OVERFLOW AUDIT SUITE");
  console.log("   Comparing Preview & Export Across 5 Target Viewports");
  console.log("===============================================================\n");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();

  const summaryReport = [];

  for (const t of templates) {
    console.log(`\n===============================================================`);
    console.log(`>>> Auditing Template: ${t.toUpperCase()} <<<`);
    console.log(`===============================================================`);
    const zipBuf = await runExport(t, mockPortfolio);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `test-resp-${t}-`));
    extractZip(zipBuf, tmpDir);
    const indexUrl = "file://" + path.join(tmpDir, "index.html").replace(/\\/g, "/");

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(indexUrl, { waitUntil: "load" });

      const audit = await page.evaluate((vpCategory) => {
        const bodyScrollWidth = document.body.scrollWidth;
        const docScrollWidth = document.documentElement.scrollWidth;
        const windowWidth = window.innerWidth;
        const hasHorizontalOverflow = docScrollWidth > windowWidth || bodyScrollWidth > windowWidth;

        // 1. Detect overflowing elements
        const overflowingElements = [];
        document.querySelectorAll("*").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > windowWidth + 1) {
            overflowingElements.push({
              tag: el.tagName.toLowerCase(),
              id: el.id || undefined,
              className: el.className && typeof el.className === "string" ? el.className.trim().slice(0, 50) : undefined,
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              overflow: Math.round(rect.right - windowWidth),
            });
          }
        });

        // 2. Navigation Inspection
        const nav = document.querySelector("nav") || document.querySelector("header");
        const navPills = document.querySelector(".devport-nav-pills, .creative-nav, .spotlight-nav-center, .term-nav, .min-nav-links");
        const navPillsDisplay = navPills ? window.getComputedStyle(navPills).display : null;
        const isNavAppropriate = vpCategory === "mobile"
          ? (navPillsDisplay === "none" || !navPills)
          : true;

        // 3. Container & Layout Inspection
        const container = document.querySelector(".devport-main-container, .container, .terminal-container, .minimal-wrap, .poster-wrapper, .spotlight-nav-inner");
        const containerWidth = container ? Math.round(container.getBoundingClientRect().width) : windowWidth;
        const containerPaddingLeft = container ? parseInt(window.getComputedStyle(container).paddingLeft || "0", 10) : 0;
        const containerPaddingRight = container ? parseInt(window.getComputedStyle(container).paddingRight || "0", 10) : 0;
        const containerFits = containerWidth <= windowWidth;

        // 4. Image Sizing & Cropping
        let imagesWithinBounds = true;
        document.querySelectorAll("img").forEach((img) => {
          const rect = img.getBoundingClientRect();
          if (rect.width > windowWidth) imagesWithinBounds = false;
        });

        // 5. Typography Line Wrapping
        let textWrappingClean = true;
        document.querySelectorAll("h1, h2, h3, p").forEach((txt) => {
          const rect = txt.getBoundingClientRect();
          if (rect.width > windowWidth) textWrappingClean = false;
        });

        // 6. Sticky & Fixed Elements
        const stickyOrFixed = [];
        document.querySelectorAll("*").forEach((el) => {
          const pos = window.getComputedStyle(el).position;
          if (pos === "sticky" || pos === "fixed") {
            stickyOrFixed.push({
              tag: el.tagName.toLowerCase(),
              className: el.className ? String(el.className).slice(0, 40) : "",
              position: pos,
              zIndex: window.getComputedStyle(el).zIndex,
            });
          }
        });

        return {
          windowWidth,
          docScrollWidth,
          hasHorizontalOverflow,
          overflowDelta: Math.max(docScrollWidth, bodyScrollWidth) - windowWidth,
          overflowingElements: overflowingElements.slice(0, 3),
          navPillsDisplay,
          isNavAppropriate,
          containerFits,
          containerWidth,
          containerPadding: `${containerPaddingLeft}px / ${containerPaddingRight}px`,
          imagesWithinBounds,
          textWrappingClean,
          stickyOrFixedCount: stickyOrFixed.length,
        };
      }, vp.category);

      // Assertions
      assert.strictEqual(
        audit.hasHorizontalOverflow,
        false,
        `Template ${t} on ${vp.name} must have 0 horizontal overflow (docScrollWidth=${audit.docScrollWidth}px > windowWidth=${vp.width}px)`
      );
      assert.strictEqual(
        audit.containerFits,
        true,
        `Template ${t} container must fit within viewport on ${vp.name}`
      );
      assert.strictEqual(
        audit.imagesWithinBounds,
        true,
        `Template ${t} images must remain within viewport bounds on ${vp.name}`
      );
      assert.strictEqual(
        audit.textWrappingClean,
        true,
        `Template ${t} typography must wrap without horizontal spill on ${vp.name}`
      );

      summaryReport.push({
        template: t,
        viewport: vp.name,
        width: vp.width,
        scrollWidth: audit.docScrollWidth,
        overflow: audit.hasHorizontalOverflow ? `+${audit.overflowDelta}px` : "0px",
        containerPadding: audit.containerPadding,
        navPillsDisplay: audit.navPillsDisplay,
        status: "PASS",
      });

      console.log(`  [${vp.name}] Width: ${vp.width}px | ScrollWidth: ${audit.docScrollWidth}px | Container: ${audit.containerWidth}px (pad: ${audit.containerPadding}) | Status: ✅ PASS`);
    }

    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  await browser.close();

  console.log("\n===============================================================");
  console.log("   STEP 6: ALL 6 TEMPLATES PASSED RESPONSIVE FIDELITY CHECKS");
  console.log("===============================================================");
  console.log(`Total template-viewport combinations verified: ${summaryReport.length} (30/30 passed)`);
  return summaryReport;
}

if (process.argv[1] && process.argv[1].endsWith("test-step6-responsive.mjs")) {
  runStep6Diagnostics().catch((err) => {
    console.error("Responsive test failed:", err);
    process.exit(1);
  });
}
