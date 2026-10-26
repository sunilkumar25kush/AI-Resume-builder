import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import zlib from "node:zlib";
import {
  exportPortfolioAsStaticZip,
  exportPortfolioAsSourceZip,
  sanitizePortfolioData,
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

function runExportToBuffer(exportFn, rawPortfolio) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const res = {
      headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      write(chunk) {
        if (chunk) chunks.push(Buffer.from(chunk));
        return true;
      },
      end(chunk) {
        if (chunk) chunks.push(Buffer.from(chunk));
        this.finished = true;
        resolve(Buffer.concat(chunks));
      },
      on(event, cb) {
        if (event === "finish") this.onFinish = cb;
        if (event === "error") this.onError = cb;
      },
      once() {},
      emit() {},
    };
    exportFn(rawPortfolio, res).catch(reject);
  });
}

async function runStep4Tests() {
  console.log("=== STEP 4: PRESERVE PORTFOLIO DATA AND CUSTOMIZATION DURING EXPORT ===");

  // 1. Realistic test portfolio with extensive customizations and optional fields
  const mockBasePortfolio = {
    _id: "portfolio-mongo-id-9999",
    userId: "user-private-id-1234",
    resumeId: "resume-private-id-5678",
    __v: 3,
    title: "Senior Lead Architect Portfolio",
    slug: "alex-chen-lead",
    isPublished: true,
    profile: {
      fullName: "Alexandria Chen",
      headline: "Principal Systems Architect & Distributed Systems Specialist",
      bio: "Over a decade of experience designing fault-tolerant, high-throughput backend infrastructure and modern web architectures.",
      email: "alex.chen@distributed-systems.dev",
      phone: "+1 (555) 382-9012",
      location: "San Francisco, CA",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    },
    socialLinks: [
      { platform: "github", url: "https://github.com/alexchen", label: "GitHub" },
      { platform: "linkedin", url: "https://linkedin.com/in/alexchen", label: "LinkedIn" },
      { platform: "twitter", url: "https://twitter.com/alexchen", label: "Twitter" },
    ],
    skills: [
      { name: "Distributed Systems", category: "Core" },
      { name: "Rust", category: "Languages" },
      { name: "Go", category: "Languages" },
      { name: "TypeScript", category: "Languages" },
      { name: "Kubernetes", category: "Infra" },
      { name: "Kafka", category: "Infra" },
    ],
    projects: [
      {
        title: "ChronosDB",
        description: "A distributed time-series engine with sub-millisecond query latencies and automatic tiering.",
        role: "Lead Systems Architect",
        highlights: [
          "Implemented LSM-tree storage layer in Rust with zero-copy deserialization",
          "Scaled cluster to 10M writes/second across 48 nodes",
        ],
        tags: ["Rust", "Distributed Systems", "Raft"],
        demoUrl: "https://chronos-demo.internal.dev",
        liveUrl: "https://chronosdb.io",
        repoUrl: "https://github.com/alexchen/chronosdb",
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
        featured: true,
      },
      {
        title: "KubeMesh CLI",
        description: "Zero-configuration service mesh diagnostic CLI and visualization dashboard.",
        role: "Creator & Maintainer",
        highlights: ["Adopted by over 5,000 DevOps engineers worldwide"],
        tags: ["Go", "Kubernetes", "eBPF"],
        liveUrl: "https://kubemesh.dev",
        repoUrl: "https://github.com/alexchen/kubemesh",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        featured: false,
      },
    ],
    experience: [
      {
        title: "Principal Infrastructure Architect",
        company: "Apex Cloud Technologies",
        location: "San Francisco, CA",
        startDate: "2021",
        endDate: "Present",
        current: true,
        description: "Directing architecture for the core multi-tenant control plane serving 500k customers.",
        highlights: [
          "Spearheaded multi-region replication reducing p99 latency by 45%",
          "Mentored 18 senior staff engineers across 4 squads",
        ],
        technologies: ["Rust", "Go", "Kubernetes", "gRPC"],
      },
      {
        title: "Senior Backend Engineer",
        company: "DataFlow Stream",
        location: "Seattle, WA",
        startDate: "2018",
        endDate: "2021",
        current: false,
        description: "Engineered real-time analytics pipelines handling 2B events per day.",
        highlights: ["Built custom Kafka connectors achieving 99.999% uptime"],
        technologies: ["Kafka", "Java", "AWS", "Terraform"],
      },
    ],
    education: [
      {
        institution: "University of California, Berkeley",
        degree: "B.S. Electrical Engineering & Computer Sciences",
        fieldOfStudy: "Computer Systems",
        startDate: "2014",
        endDate: "2018",
        graduationDate: "May 2018",
      },
    ],
    certifications: [
      {
        name: "Certified Kubernetes Administrator (CKA)",
        issuer: "Cloud Native Computing Foundation",
        issueDate: "2022",
      },
    ],
    design: {
      template: "devport",
      templateVersion: "2.8.4",
      theme: "dark",
      primaryColor: "#f97316",
      fontFamily: "Inter",
      // Reordered sections: projects comes first before about!
      sectionOrder: ["projects", "skills", "about", "experience", "education", "contact"],
      // Hidden section: experience is explicitly hidden!
      sectionVisibility: {
        hero: true,
        projects: true,
        skills: true,
        about: true,
        experience: false, // HIDDEN
        education: true,
        contact: true,
      },
      customLabels: {
        about: "Architectural Philosophy",
        projects: "Flagship Systems",
        contact: "Schedule Consultation",
      },
      customText: {
        heroGreeting: "Engineered for Resilient Scale",
        contactHeadline: "Let's Architect Together",
      },
      templateSettings: {
        marqueeText: "DISTRIBUTED SYSTEMS // CLOUD ARCHITECTURE // 99.999% SLA",
        glowHalo: true,
      },
    },
  };

  // Deep clone to verify immutability later
  const originalPortfolioSnapshot = JSON.parse(JSON.stringify(mockBasePortfolio));

  // =========================================================================
  // TEST 1: Sanitization and Schema Validation
  // =========================================================================
  console.log("-> Test 1: Sanitize and schema-validate portfolio data...");
  const sanitized = sanitizePortfolioData(mockBasePortfolio);

  // Private fields must be stripped
  assert.strictEqual(sanitized._id, undefined, "_id must be stripped from public portfolio");
  assert.strictEqual(sanitized.userId, undefined, "userId must be stripped from public portfolio");
  assert.strictEqual(sanitized.resumeId, undefined, "resumeId must be stripped from public portfolio");
  assert.strictEqual(sanitized.__v, undefined, "__v must be stripped from public portfolio");

  // Custom data & metadata must be preserved
  assert.strictEqual(sanitized.design.templateVersion, "2.8.4", "templateVersion preserved");
  assert.strictEqual(sanitized.design.primaryColor, "#f97316", "primaryColor preserved");
  assert.deepStrictEqual(
    sanitized.design.sectionOrder,
    ["projects", "skills", "about", "experience", "education", "contact"],
    "sectionOrder preserved"
  );
  assert.strictEqual(sanitized.design.sectionVisibility.experience, false, "sectionVisibility.experience preserved as false");
  assert.strictEqual(sanitized.design.customLabels.projects, "Flagship Systems", "customLabels.projects preserved");
  assert.strictEqual(sanitized.design.customText.heroGreeting, "Engineered for Resilient Scale", "customText.heroGreeting preserved");

  // Optional project/experience/education fields preserved
  assert.strictEqual(sanitized.projects[0].role, "Lead Systems Architect", "project.role preserved");
  assert.strictEqual(sanitized.projects[0].demoUrl, "https://chronos-demo.internal.dev", "project.demoUrl preserved");
  assert.deepStrictEqual(sanitized.projects[0].highlights.length, 2, "project.highlights preserved");
  assert.deepStrictEqual(sanitized.experience[0].technologies, ["Rust", "Go", "Kubernetes", "gRPC"], "experience.technologies preserved");
  assert.strictEqual(sanitized.education[0].graduationDate, "May 2018", "education.graduationDate preserved");

  console.log("   ✓ Sanitization and schema validation passed cleanly.");

  // =========================================================================
  // TEST 2: Static ZIP Export with DevPort Template
  // =========================================================================
  console.log("-> Test 2: Generate Static ZIP and inspect HTML...");
  const staticZipBuffer = await runExportToBuffer(exportPortfolioAsStaticZip, mockBasePortfolio);
  assert(staticZipBuffer.length > 0, "Static ZIP buffer must not be empty");

  // Extract static zip in temp folder to inspect contents
  const tempStaticDir = fs.mkdtempSync(path.join(os.tmpdir(), "export-static-test-"));
  extractZip(staticZipBuffer, tempStaticDir);

  const staticHtmlPath = path.join(tempStaticDir, "index.html");
  assert(fs.existsSync(staticHtmlPath), "Static ZIP must contain index.html");

  const staticHtml = fs.readFileSync(staticHtmlPath, "utf-8");

  // 1. Core Profile Details
  assert(staticHtml.includes("Alexandria Chen"), "Candidate full name must appear in static HTML");
  assert(staticHtml.includes("alex.chen@distributed-systems.dev"), "Email must appear in static HTML");
  assert(staticHtml.includes("+1 (555) 382-9012"), "Phone must appear in static HTML");
  assert(staticHtml.includes("San Francisco, CA"), "Location must appear in static HTML");

  // 2. Custom Color and Font
  assert(staticHtml.includes("#f97316"), "Primary color #f97316 must appear in static HTML");

  // 3. Custom Labels and Custom Text
  assert(staticHtml.includes("Flagship Systems"), "Custom label 'Flagship Systems' must appear in static HTML");
  assert(staticHtml.includes("Architectural Philosophy"), "Custom label 'Architectural Philosophy' must appear in static HTML");
  assert(staticHtml.includes("Schedule Consultation"), "Custom label 'Schedule Consultation' must appear in static HTML");
  assert(staticHtml.includes("Engineered for Resilient Scale"), "Custom text 'Engineered for Resilient Scale' must appear in static HTML");
  assert(staticHtml.includes("Architect Together"), "Custom contact headline must appear");

  // 4. Section Reordering: projects section must appear BEFORE about section in DOM
  const projectsIndex = staticHtml.indexOf('id="projects"');
  const aboutIndex = staticHtml.indexOf('id="about"');
  assert(projectsIndex !== -1, "Projects section must be present in HTML");
  assert(aboutIndex !== -1, "About section must be present in HTML");
  assert(
    projectsIndex < aboutIndex,
    `Projects section (pos ${projectsIndex}) must appear before About section (pos ${aboutIndex}) due to custom sectionOrder`
  );

  // 5. Hidden Section: experience is hidden, so experience section must NOT be rendered
  const experienceIndex = staticHtml.indexOf('id="experience"');
  assert.strictEqual(
    experienceIndex,
    -1,
    "Experience section must NOT be rendered in HTML because sectionVisibility.experience is false"
  );

  // 6. Optional Project fields
  assert(staticHtml.includes("ChronosDB"), "Project title ChronosDB must be present");
  assert(staticHtml.includes("Lead Systems Architect"), "Project role 'Lead Systems Architect' must be present");
  assert(staticHtml.includes("https://chronos-demo.internal.dev"), "Project demoUrl must be present in HTML links");

  // 7. Security: Verify private database fields are absent from HTML
  assert(!staticHtml.includes("portfolio-mongo-id-9999"), "Internal _id must not appear in HTML");
  assert(!staticHtml.includes("user-private-id-1234"), "Internal userId must not appear in HTML");
  assert(!staticHtml.includes("resume-private-id-5678"), "Internal resumeId must not appear in HTML");

  console.log("   ✓ Static ZIP correctly honors reordering, section hiding, custom labels, custom text, and security stripping.");

  // =========================================================================
  // TEST 3: Static ZIP Export with Poster Template
  // =========================================================================
  console.log("-> Test 3: Generate Static ZIP with Poster template...");
  const posterPortfolio = {
    ...mockBasePortfolio,
    design: {
      ...mockBasePortfolio.design,
      template: "poster",
      customLabels: {
        projects: "FEATURED ARCHIVES",
        contact: "COMMENCE DIALOGUE",
      },
      templateSettings: {
        marqueeText: "DISPATCH 2026 // POSTER ARCHIVE",
      },
      sectionOrder: ["skills", "projects", "contact"],
      sectionVisibility: {
        about: false,
        experience: false,
        education: false,
      },
    },
  };

  const posterZipBuffer = await runExportToBuffer(exportPortfolioAsStaticZip, posterPortfolio);
  const tempPosterDir = fs.mkdtempSync(path.join(os.tmpdir(), "export-poster-test-"));
  extractZip(posterZipBuffer, tempPosterDir);

  const posterHtmlPath = path.join(tempPosterDir, "index.html");
  const posterHtml = fs.readFileSync(posterHtmlPath, "utf-8");

  assert(posterHtml.includes("FEATURED ARCHIVES"), "Poster custom label 'FEATURED ARCHIVES' rendered");
  assert(posterHtml.includes("COMMENCE DIALOGUE"), "Poster custom label 'COMMENCE DIALOGUE' rendered");
  assert(posterHtml.includes("DISPATCH 2026 // POSTER ARCHIVE"), "Poster custom marquee text rendered");
  assert(!posterHtml.includes('id="about"'), "Poster about section hidden per sectionVisibility");
  assert(!posterHtml.includes('id="experience"'), "Poster experience section hidden per sectionVisibility");
  console.log("   ✓ Poster static export preserves custom labels, marquee text, and visibility.");

  // =========================================================================
  // TEST 4: React Source ZIP Export
  // =========================================================================
  console.log("-> Test 4: Generate React Source ZIP and inspect portfolioData.json...");
  const sourceZipBuffer = await runExportToBuffer(exportPortfolioAsSourceZip, mockBasePortfolio);
  assert(sourceZipBuffer.length > 0, "Source ZIP buffer must not be empty");

  const tempSourceDir = fs.mkdtempSync(path.join(os.tmpdir(), "export-source-test-"));
  extractZip(sourceZipBuffer, tempSourceDir);

  // Check required React source files
  const requiredFiles = [
    "package.json",
    "index.html",
    "vite.config.js",
    "src/main.jsx",
    "src/App.jsx",
    "src/portfolioData.json",
    "src/components/common/ThemeWrapper.jsx",
    "src/components/common/BrandIcon.jsx",
    "src/components/common/SafeLink.jsx",
    "src/components/templates/DevPortTemplate.jsx",
  ];

  for (const rf of requiredFiles) {
    const fullPath = path.join(tempSourceDir, rf);
    assert(fs.existsSync(fullPath), `Source ZIP must include file '${rf}'`);
  }

  // Inspect portfolioData.json inside source zip
  const dataPath = path.join(tempSourceDir, "src/portfolioData.json");
  const extractedData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  // Assert exact configuration preservation in source zip
  assert.strictEqual(extractedData.profile.fullName, "Alexandria Chen");
  assert.strictEqual(extractedData.design.template, "devport");
  assert.strictEqual(extractedData.design.templateVersion, "2.8.4");
  assert.strictEqual(extractedData.design.primaryColor, "#f97316");
  assert.deepStrictEqual(
    extractedData.design.sectionOrder,
    ["projects", "skills", "about", "experience", "education", "contact"]
  );
  assert.strictEqual(extractedData.design.sectionVisibility.experience, false);
  assert.strictEqual(extractedData.design.customLabels.projects, "Flagship Systems");
  assert.strictEqual(extractedData.design.customText.heroGreeting, "Engineered for Resilient Scale");
  assert.strictEqual(extractedData.design.templateSettings.marqueeText, "DISTRIBUTED SYSTEMS // CLOUD ARCHITECTURE // 99.999% SLA");

  // Private fields absent from portfolioData.json
  assert.strictEqual(extractedData._id, undefined, "_id absent from portfolioData.json");
  assert.strictEqual(extractedData.userId, undefined, "userId absent from portfolioData.json");
  assert.strictEqual(extractedData.resumeId, undefined, "resumeId absent from portfolioData.json");
  assert.strictEqual(extractedData.__v, undefined, "__v absent from portfolioData.json");

  // Inspect src/components/templates/DevPortTemplate.jsx to verify it accepts props and renders dynamically
  const devportJsxPath = path.join(tempSourceDir, "src/components/templates/DevPortTemplate.jsx");
  const devportJsx = fs.readFileSync(devportJsxPath, "utf-8");
  assert(devportJsx.includes("sectionOrder ="), "DevPortTemplate must accept sectionOrder prop");
  assert(devportJsx.includes("hiddenSections ="), "DevPortTemplate must accept hiddenSections prop");
  assert(devportJsx.includes("sectionMap"), "DevPortTemplate must use sectionMap for dynamic ordering");

  console.log("   ✓ React Source ZIP cleanly preserves all configurations, templates, and data without leaks.");

  // =========================================================================
  // TEST 5: Immutability Verification
  // =========================================================================
  console.log("-> Test 5: Verify input object immutability...");
  assert.deepStrictEqual(
    mockBasePortfolio,
    originalPortfolioSnapshot,
    "The input portfolio object MUST NOT be mutated by the export process"
  );
  console.log("   ✓ Immutability confirmed. Original object was never modified.");

  // Cleanup temp files
  fs.rmSync(tempStaticDir, { recursive: true, force: true });
  fs.rmSync(tempPosterDir, { recursive: true, force: true });
  fs.rmSync(tempSourceDir, { recursive: true, force: true });

  console.log("\n>>> ALL STEP 4 EXPORT PRESERVATION & CUSTOMIZATION TESTS PASSED! <<<");
}

runStep4Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
