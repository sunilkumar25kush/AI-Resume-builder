import "dotenv/config";
import assert from "node:assert/strict";
import { Writable } from "node:stream";
import zlib from "node:zlib";
import {
  sanitizePortfolioData,
  exportPortfolioAsStaticZip,
  exportPortfolioAsSourceZip,
  getExportFilename,
} from "../src/services/portfolioExport.service.js";
import { slugify } from "../src/services/portfolio.service.js";

// Helper mock response stream that collects zip chunks into a buffer and tracks zip entries
class MockResponseStream extends Writable {
  constructor() {
    super();
    this.chunks = [];
    this.headers = {};
    this.statusCode = 200;
  }

  setHeader(key, value) {
    this.headers[key] = value;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    callback();
  }

  getBuffer() {
    return Buffer.concat(this.chunks);
  }
}

// A zip parser that reads the central directory and decompresses entries
function inspectZipBuffer(buf) {
  const files = [];
  let offset = 0;

  while (offset < buf.length - 4) {
    if (buf.readUInt32LE(offset) === 0x02014b50) {
      // Central directory file header
      const compMethod = buf.readUInt16LE(offset + 10);
      const compSize = buf.readUInt32LE(offset + 20);
      const uncompSize = buf.readUInt32LE(offset + 24);
      const nameLen = buf.readUInt16LE(offset + 28);
      const extraLen = buf.readUInt16LE(offset + 30);
      const commentLen = buf.readUInt16LE(offset + 32);
      const localOff = buf.readUInt32LE(offset + 42);
      const filename = buf.toString("utf8", offset + 46, offset + 46 + nameLen);

      // Read local header to get local extra length
      const localNameLen = buf.readUInt16LE(localOff + 26);
      const localExtraLen = buf.readUInt16LE(localOff + 28);
      const dataStart = localOff + 30 + localNameLen + localExtraLen;
      const compData = buf.subarray(dataStart, dataStart + compSize);

      let content = "";
      try {
        if (compMethod === 8) {
          content = zlib.inflateRawSync(compData).toString("utf8");
        } else if (compMethod === 0) {
          content = compData.toString("utf8");
        }
      } catch (e) {
        content = "";
      }

      files.push({ filename, content, compSize, uncompSize });
      offset += 46 + nameLen + extraLen + commentLen;
    } else {
      offset++;
    }
  }

  return files;
}

// Comprehensive mock portfolio with all fields and customization settings
function createSamplePortfolio(templateName) {
  return {
    _id: "67bc9910543210fe98765432",
    userId: "67bc9910543210fe98765431",
    resumeId: "67bc9910543210fe98765430",
    __v: 3,
    title: `Alex Mercer - ${templateName} Portfolio`,
    slug: `alex-mercer-${templateName}`,
    status: "published",
    profile: {
      fullName: "Alex Mercer",
      headline: "Senior Full Stack Engineer & Cloud Architect",
      bio: "Crafting scalable distributed systems and engaging user interfaces for modern web platforms.",
      email: "alex.mercer@example.com",
      phone: "+1 (555) 234-5678",
      location: "San Francisco, CA",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400",
    },
    socialLinks: [
      { platform: "github", label: "GitHub", url: "https://github.com/alexmercer" },
      { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/alexmercer" },
      { platform: "twitter", label: "Twitter", url: "https://x.com/alexmercer" },
    ],
    skills: [
      { name: "TypeScript", category: "Languages", level: "expert" },
      { name: "React", category: "Frontend", level: "expert" },
      { name: "Node.js", category: "Backend", level: "advanced" },
      { name: "Python", category: "Backend", level: "advanced" },
      { name: "Docker", category: "DevOps", level: "intermediate" },
    ],
    experience: [
      {
        title: "Staff Software Engineer",
        company: "Stripe",
        location: "San Francisco, CA",
        startDate: "2022",
        endDate: "",
        current: true,
        description: "Leading core payments infrastructure modernization and developer ergonomics.",
        highlights: [
          "Scaled payment processing throughput by 45% using event-driven architectures.",
          "Mentored 8 senior engineers and defined API standards across the platform organization.",
        ],
      },
      {
        title: "Senior Full Stack Engineer",
        company: "Airbnb",
        location: "San Francisco, CA",
        startDate: "2019",
        endDate: "2022",
        current: false,
        description: "Built host management dashboards and high-converting onboarding flows.",
        highlights: [
          "Architected real-time messaging pipeline reducing message delivery latency by 60%.",
        ],
      },
    ],
    education: [
      {
        institution: "University of California, Berkeley",
        degree: "B.S. in Computer Science",
        fieldOfStudy: "Computer Science",
        startDate: "2015",
        endDate: "2019",
        grade: "3.9 GPA",
      },
    ],
    projects: [
      {
        title: "OmniCloud Platform",
        description: "Zero-latency edge computing orchestrator with automated multi-cloud failover.",
        tags: ["Rust", "TypeScript", "React", "Docker"],
        liveUrl: "https://omnicloud.example.com",
        repoUrl: "https://github.com/alexmercer/omnicloud",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600",
        featured: true,
      },
      {
        title: "DevPulse Insights",
        description: "Real-time engineering productivity telemetry tool for distributed teams.",
        tags: ["Node.js", "React", "TailwindCSS"],
        liveUrl: "https://devpulse.example.com",
        repoUrl: "https://github.com/alexmercer/devpulse",
        imageUrl: "",
        featured: false,
      },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect Professional",
        issuer: "Amazon Web Services",
        issueDate: "2024",
        url: "https://aws.amazon.com/verify/12345",
      },
    ],
    design: {
      template: templateName,
      theme: "dark",
      primaryColor: "#3b82f6",
      fontFamily: "Inter",
      backgroundEffect: "gradient_mesh",
      sectionOrder: ["hero", "about", "skills", "projects", "experience", "education", "certifications", "contact"],
      sectionVisibility: { certifications: true },
      layoutOptions: { projectCardLayout: "grid" },
      templateSettings: {
        glowHalo: true,
        expertiseTree: true,
        marqueeText: "ARCHITECT • BUILDER • LEAD • SCALABILITY",
      },
      customCss: "/* custom candidate css */",
    },
    publication: {
      isPublic: true,
      publishedAt: new Date("2026-01-15"),
      customDomain: "",
      seoTitle: `Alex Mercer | ${templateName.toUpperCase()} Portfolio`,
      seoDescription: "Staff Software Engineer with deep expertise in cloud architectures and full stack systems.",
    },
  };
}

async function runTests() {
  console.log("=================================================");
  console.log("STEP 7: PORTFOLIO PUBLISHING & EXPORT VERIFICATION");
  console.log("=================================================\n");

  // ---------------------------------------------------------------------------
  // TEST 1: URL Slug Validation & Formatting
  // ---------------------------------------------------------------------------
  console.log("1. Testing URL Slug Formatting & Sanitization...");
  assert.equal(slugify("Alex Mercer"), "alex-mercer");
  assert.equal(slugify("Full Stack Developer 2026!"), "full-stack-developer-2026");
  assert.equal(slugify("   --Multiple---Dashes--  "), "multiple-dashes");
  assert.equal(slugify("Special#Characters@Are&Stripped"), "specialcharactersarestripped");
  console.log("   ✓ slugify properly generates lowercase alphanumeric hyphenated slugs\n");

  // ---------------------------------------------------------------------------
  // TEST 2: Public Data Sanitization (Security & Privacy Defense)
  // ---------------------------------------------------------------------------
  console.log("2. Testing Portfolio Data Sanitization...");
  const rawPortfolio = createSamplePortfolio("spotlight");
  const sanitized = sanitizePortfolioData(rawPortfolio);

  // Verify internal DB fields are not leaked
  assert.equal(sanitized._id, undefined, "_id must be excluded");
  assert.equal(sanitized.userId, undefined, "userId must be excluded");
  assert.equal(sanitized.resumeId, undefined, "resumeId must be excluded");
  assert.equal(sanitized.__v, undefined, "__v must be excluded");

  // Verify customization is preserved
  assert.equal(sanitized.design.template, "spotlight");
  assert.equal(sanitized.design.primaryColor, "#3b82f6");
  assert.equal(sanitized.design.backgroundEffect, "gradient_mesh");
  assert.equal(sanitized.design.layoutOptions.projectCardLayout, "grid");
  assert.equal(sanitized.design.templateSettings.glowHalo, true);
  assert.equal(sanitized.design.templateSettings.marqueeText, "ARCHITECT • BUILDER • LEAD • SCALABILITY");
  assert.equal(sanitized.projects[0].imageUrl.includes("unsplash.com"), true);
  assert.equal(sanitized.projects[0].repoUrl, "https://github.com/alexmercer/omnicloud");
  console.log("   ✓ Internal DB IDs, user tokens, and private resume fields stripped");
  console.log("   ✓ All customization settings (colors, backgroundEffect, templateSettings, imageUrl) preserved\n");

  // ---------------------------------------------------------------------------
  // TEST 3: Standalone Static & Source ZIP Exports across ALL 6 Integrated Templates
  // ---------------------------------------------------------------------------
  const TEMPLATES_TO_TEST = ["spotlight", "poster", "devport", "creative", "developer", "minimal"];

  console.log(`3. Testing Exports across ALL ${TEMPLATES_TO_TEST.length} Integrated Templates...`);

  for (const tpl of TEMPLATES_TO_TEST) {
    const portfolio = createSamplePortfolio(tpl);
    console.log(`\n   --- Verifying Template: [${tpl.toUpperCase()}] ---`);

    // A. Test Static Website ZIP Export
    const staticRes = new MockResponseStream();
    await exportPortfolioAsStaticZip(portfolio, staticRes);
    const staticBuf = staticRes.getBuffer();
    assert(staticBuf.length > 500, `Static ZIP for ${tpl} must not be empty`);
    assert.equal(staticRes.headers["Content-Type"], "application/zip");
    assert(staticRes.headers["Content-Disposition"].includes("static-website.zip"));

    const staticFiles = inspectZipBuffer(staticBuf);
    const staticFileNames = staticFiles.map((f) => f.filename);
    assert(staticFileNames.includes("index.html"), `${tpl} static ZIP must contain index.html`);
    assert(staticFileNames.includes("assets/style.css"), `${tpl} static ZIP must contain assets/style.css`);
    assert(staticFileNames.includes("assets/script.js"), `${tpl} static ZIP must contain assets/script.js`);
    assert(staticFileNames.includes("README.md"), `${tpl} static ZIP must contain README.md`);

    // Verify static zip does NOT leak sensitive credentials or private IDs
    const staticAllText = staticFiles.map((f) => f.content).join("\n");
    assert(!staticAllText.includes("67bc9910543210fe98765431"), "Static ZIP must not leak userId");
    assert(!staticAllText.includes("67bc9910543210fe98765430"), "Static ZIP must not leak resumeId");
    assert(staticAllText.includes("Alex Mercer"), "Static ZIP must contain candidate name");
    assert(staticAllText.includes("Google Fonts CDN"), "README must document external Google Fonts dependency");
    assert(staticAllText.includes("100% Independent"), "README must verify zero backend dependency");

    console.log(`     ✓ Static ZIP generated (${staticBuf.length} bytes, contains HTML, CSS, JS, README)`);

    // B. Test React Source Code ZIP Export
    const sourceRes = new MockResponseStream();
    await exportPortfolioAsSourceZip(portfolio, sourceRes);
    const sourceBuf = sourceRes.getBuffer();
    assert(sourceBuf.length > 1000, `Source ZIP for ${tpl} must not be empty`);
    assert.equal(sourceRes.headers["Content-Type"], "application/zip");
    assert(sourceRes.headers["Content-Disposition"].includes("react-source.zip"));

    const sourceFiles = inspectZipBuffer(sourceBuf);
    const sourceFileNames = sourceFiles.map((f) => f.filename);
    assert(sourceFileNames.includes("package.json"), `${tpl} source ZIP must contain package.json`);
    assert(sourceFileNames.includes("vite.config.js"), `${tpl} source ZIP must contain vite.config.js`);
    assert(sourceFileNames.includes("index.html"), `${tpl} source ZIP must contain index.html`);
    assert(sourceFileNames.includes("src/index.css"), `${tpl} source ZIP must contain src/index.css`);
    assert(sourceFileNames.includes("src/portfolioData.json"), `${tpl} source ZIP must contain src/portfolioData.json`);
    assert(sourceFileNames.includes("src/main.jsx"), `${tpl} source ZIP must contain src/main.jsx`);
    assert(sourceFileNames.includes("src/App.jsx"), `${tpl} source ZIP must contain src/App.jsx`);
    assert(sourceFileNames.includes("src/components/common/BrandIcon.jsx"), `${tpl} source ZIP must contain BrandIcon.jsx`);
    assert(sourceFileNames.includes("src/components/common/SafeLink.jsx"), `${tpl} source ZIP must contain SafeLink.jsx`);
    assert(sourceFileNames.includes("src/components/common/urlUtils.js"), `${tpl} source ZIP must contain urlUtils.js`);
    assert(sourceFileNames.includes("src/components/templates/SpotlightTemplate.jsx"), `${tpl} source ZIP must contain SpotlightTemplate.jsx`);
    assert(sourceFileNames.includes("src/components/templates/PosterTemplate.jsx"), `${tpl} source ZIP must contain PosterTemplate.jsx`);
    assert(sourceFileNames.includes("src/components/templates/DevPortTemplate.jsx"), `${tpl} source ZIP must contain DevPortTemplate.jsx`);
    assert(sourceFileNames.includes("src/components/templates/ModernCreativeTemplate.jsx"), `${tpl} source ZIP must contain ModernCreativeTemplate.jsx`);
    assert(sourceFileNames.includes("src/components/templates/DeveloperTemplate.jsx"), `${tpl} source ZIP must contain DeveloperTemplate.jsx`);
    assert(sourceFileNames.includes("src/components/templates/MinimalTemplate.jsx"), `${tpl} source ZIP must contain MinimalTemplate.jsx`);
    assert(sourceFileNames.includes("README.md"), `${tpl} source ZIP must contain README.md`);
    assert(sourceFileNames.includes("LICENSE"), `${tpl} source ZIP must contain LICENSE`);

    const sourceAllText = sourceFiles.map((f) => f.content).join("\n");
    assert(!sourceAllText.includes("67bc9910543210fe98765431"), "Source ZIP must not leak userId");
    assert(!sourceAllText.includes("67bc9910543210fe98765430"), "Source ZIP must not leak resumeId");
    assert(sourceAllText.includes("100% Standalone"), "README must document standalone zero-backend status");

    console.log(`     ✓ React Source ZIP generated (${sourceBuf.length} bytes, full Vite+React 19 project)`);
  }

  console.log("\n=================================================");
  console.log("ALL 6 TEMPLATES TESTED & VERIFIED SUCCESSFULLY! ✓");
  console.log("=================================================");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
