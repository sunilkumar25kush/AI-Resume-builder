import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import zlib from "node:zlib";
import { execSync } from "node:child_process";
import { exportPortfolioAsSourceZip, sanitizePortfolioData } from "../src/services/portfolioExport.service.js";

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

const mockPortfolio = {
  title: "Test Portfolio",
  slug: "test-portfolio",
  profile: {
    fullName: "Alex Morgan",
    headline: "Senior Frontend Engineer & Designer",
    bio: "Passionate about creating accessible, pixel-perfect user interfaces.",
    email: "alex@example.com",
    phone: "+1 555-0199",
    location: "San Francisco, CA",
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
  },
  skills: [
    { name: "JavaScript", category: "frontend" },
    { name: "TypeScript", category: "frontend" },
    { name: "React", category: "frontend" },
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
    },
  ],
  socialLinks: [
    { platform: "github", url: "https://github.com/alexmorgan" },
  ],
  publication: {
    seoTitle: "Alex Morgan - Portfolio",
    seoDescription: "Portfolio of Alex Morgan",
  },
};

async function main() {
  console.log("=== VERIFYING REACT SOURCE ZIP ISOLATED BUILD ===");

  const buf = await runExportToBuffer(exportPortfolioAsSourceZip, mockPortfolio);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-source-build-"));
  console.log("Extracting to:", tempDir);
  extractZip(buf, tempDir);

  const rootNodeModules = path.resolve("node_modules");
  const tempNodeModules = path.join(tempDir, "node_modules");

  try {
    fs.symlinkSync(rootNodeModules, tempNodeModules, "junction");
    console.log("Linked root node_modules");
  } catch (err) {
    console.log("Symlink error:", err.message);
  }

  // Run npx vite build in tempDir
  console.log("Running vite build in exported source directory...");
  try {
    const buildOutput = execSync("npx vite build", {
      cwd: tempDir,
      stdio: "pipe",
      encoding: "utf8",
    });
    console.log("Build Output:\n", buildOutput);
    console.log("✓ React Source Export built successfully with zero syntax or bundling errors!");
  } catch (err) {
    console.error("Build failed stdout:", err.stdout);
    console.error("Build failed stderr:", err.stderr);
    console.error("Build failed message:", err.message);
    process.exit(1);
  } finally {
    // Clean up
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch(console.error);
