import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import zlib from "node:zlib";
import vm from "node:vm";
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

const mockPortfolio = {
  title: "Alex Morgan Portfolio",
  slug: "alex-morgan",
  profile: {
    fullName: "Alex Morgan",
    headline: "Full Stack Engineer & Creative Developer",
    bio: "Passionate full-stack developer crafting responsive, accessible web applications.",
    email: "alex@example.com",
    phone: "+1-555-0199",
    location: "San Francisco, CA",
  },
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
    { name: "JavaScript", category: "frontend" },
    { name: "TypeScript", category: "frontend" },
    { name: "React", category: "frontend" },
    { name: "Node.js", category: "backend" },
  ],
  projects: [
    {
      title: "Portfolio Generator",
      description: "Generates high quality developer portfolios.",
      tags: ["React", "Node.js"],
      liveUrl: "https://example.com/demo",
      repoUrl: "https://github.com/alex/portfolio-gen",
    },
  ],
  experience: [
    {
      company: "Tech Corp",
      title: "Senior Engineer",
      startDate: "2022",
      endDate: "Present",
      current: true,
      description: "Led core frontend initiatives.",
    },
  ],
  education: [
    {
      institution: "MIT",
      degree: "B.S. in Computer Science",
      startDate: "2018",
      endDate: "2022",
    },
  ],
  certifications: [
    {
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      issueDate: "2023",
      url: "https://aws.amazon.com/verify/123",
    },
  ],
  socialLinks: [
    { platform: "github", url: "https://github.com/alexmorgan" },
    { platform: "linkedin", url: "https://linkedin.com/in/alexmorgan" },
  ],
  publication: {
    seoTitle: "Alex Morgan - Portfolio",
    seoDescription: "Portfolio of Alex Morgan",
  },
};

const templates = ["devport", "spotlight", "poster", "creative", "developer", "minimal"];

async function runStep5Tests() {
  console.log("=== STEP 5: TEMPLATE INTERACTIONS & ANIMATIONS AUDIT ===");

  for (const t of templates) {
    console.log(`\n--- Auditing Template: ${t} ---`);
    const testData = JSON.parse(JSON.stringify(mockPortfolio));
    testData.design.template = t;

    // 1. Static ZIP export
    const staticBuf = await runExportToBuffer(exportPortfolioAsStaticZip, testData);
    assert.ok(staticBuf.length > 500, `Static ZIP for ${t} should have content`);

    const staticDir = fs.mkdtempSync(path.join(os.tmpdir(), `test-step5-static-${t}-`));
    extractZip(staticBuf, staticDir);

    const indexPath = path.join(staticDir, "index.html");
    const cssPath = path.join(staticDir, "assets", "style.css");
    const jsPath = path.join(staticDir, "assets", "script.js");

    assert.ok(fs.existsSync(indexPath), `index.html must exist for ${t}`);
    assert.ok(fs.existsSync(cssPath), `assets/style.css must exist for ${t}`);
    assert.ok(fs.existsSync(jsPath), `assets/script.js must exist for ${t}`);

    const indexHtml = fs.readFileSync(indexPath, "utf8");
    const styleCss = fs.readFileSync(cssPath, "utf8");
    const scriptJs = fs.readFileSync(jsPath, "utf8");

    // Syntax check on script.js
    assert.doesNotThrow(() => {
      new vm.Script(scriptJs);
    }, `script.js for ${t} must be valid JavaScript`);

    // Verify script.js is linked in index.html
    assert.ok(
      indexHtml.includes('src="assets/script.js"') || indexHtml.includes("src='assets/script.js'"),
      `index.html for ${t} must reference assets/script.js`
    );

    // Verify reduced motion in style.css
    assert.ok(
      styleCss.includes("prefers-reduced-motion"),
      `assets/style.css for ${t} must contain @media (prefers-reduced-motion: reduce)`
    );

    // Verify back to top button in index.html
    assert.ok(
      indexHtml.includes('id="scrollTopBtn"') || indexHtml.includes('id="top"'),
      `index.html for ${t} must contain scroll to top button/anchor`
    );

    // Verify all anchor link targets exist in HTML
    const anchorMatches = [...indexHtml.matchAll(/href="#([a-zA-Z0-9_-]+)"/g)];
    for (const match of anchorMatches) {
      const targetId = match[1];
      if (targetId && targetId !== "top") {
        assert.ok(
          indexHtml.includes(`id="${targetId}"`),
          `index.html for ${t} links to #${targetId} but no element with id="${targetId}" exists`
        );
      }
    }

    // Verify safe external links have noopener
    if (indexHtml.includes('target="_blank"')) {
      assert.ok(
        indexHtml.includes('rel="noopener'),
        `External links in index.html for ${t} must include rel="noopener"`
      );
    }

    console.log(`✓ Static export for ${t} verified: valid script.js, reduced-motion CSS, back-to-top, safe links.`);

    // 2. React Source ZIP export
    const sourceBuf = await runExportToBuffer(exportPortfolioAsSourceZip, testData);
    assert.ok(sourceBuf.length > 500, `Source ZIP for ${t} should have content`);

    const sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), `test-step5-source-${t}-`));
    extractZip(sourceBuf, sourceDir);

    const sourceCssPath = path.join(sourceDir, "src", "index.css");
    assert.ok(fs.existsSync(sourceCssPath), `src/index.css must exist in source export for ${t}`);

    const sourceCss = fs.readFileSync(sourceCssPath, "utf8");
    assert.ok(
      sourceCss.includes("prefers-reduced-motion"),
      `src/index.css in source export for ${t} must contain @media (prefers-reduced-motion: reduce)`
    );

    console.log(`✓ React source export for ${t} verified: reduced-motion CSS and valid structure.`);
  }

  console.log("\nAll Step 5 interaction and animation tests PASSED successfully!");
}

runStep5Tests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
