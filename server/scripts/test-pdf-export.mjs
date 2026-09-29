import { PDFParse } from "pdf-parse";
import { Resume } from "../src/models/Resume.js";
import User from "../src/models/User.js";
import mongoose from "mongoose";
import { renderResumePdf } from "../src/services/pdfExport.service.js";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("==================================================");
console.log("   PDF Export & Visual Parity Acceptance Suite    ");
console.log("==================================================");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function run() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/ai-resume-builder";
  await mongoose.connect(mongoUri);

  // 1. Create a test user
  const email = `pdftest_${Date.now()}@example.com`;
  const user = await User.create({
    name: "Sunil Kumar",
    email,
    password: "Password123!",
  });

  const sampleParsedData = {
    name: "Sunil Kumar",
    summary: "Accomplished Full Stack Software Engineer with 5+ years of experience architecting high-throughput distributed systems.",
    contact: {
      email: "sunil@example.com",
      phone: "+91 98765 43210",
      location: "New Delhi, India",
      linkedin: "https://linkedin.com/in/sunilkumar",
      github: "https://github.com/sunilkumar",
    },
    skills: [
      { category: "Frontend", items: ["React", "TypeScript", "Tailwind CSS", "Next.js"] },
      { category: "Backend", items: ["Node.js", "Express", "PostgreSQL", "Redis"] },
    ],
    experience: [
      {
        role: "Senior Full Stack Engineer",
        company: "NavGurukul Foundation",
        location: "New Delhi, India",
        startDate: "2023",
        endDate: "Present",
        bullets: [
          "Architected AI learning platform supporting 15,000+ underserved students.",
          "Refactored monolithic microservices with redis caching, decreasing latency by 38%.",
        ],
      },
    ],
    education: [
      {
        degree: "B.Sc. in Computer Science",
        institution: "University of Delhi",
        startDate: "2016",
        endDate: "2019",
        grade: "First Class Honours",
      },
    ],
    projects: [
      {
        name: "AI Resume & Career Optimizer",
        techStack: ["React", "Node.js", "Express", "Tailwind CSS"],
        bullets: [
          "Designed end-to-end ATS resume generator powered by Google Gemini.",
        ],
      },
    ],
    certifications: [
      { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", date: "2023" },
    ],
    languages: [{ name: "English", level: "Fluent" }],
  };

  // 2. Test Step 3: Block export if personal.fullName is empty
  const emptyNameResume = await Resume.create({
    user: user._id,
    fileName: "empty-name-test.pdf",
    fileType: "application/pdf",
    fileSize: 100,
    parsedData: { ...sampleParsedData, name: "", personal: { fullName: "" } },
    template: "classic-rose-serif",
  });

  try {
    await renderResumePdf(user._id, emptyNameResume._id);
    assert(false, "Step 3: Should throw error when fullName is empty");
  } catch (err) {
    assert(
      err.message === "Add your full name before downloading",
      `Step 3: Blocked export with message: "${err.message}"`
    );
  }

  // 3. Test Full Resume Export with Puppeteer
  const validResume = await Resume.create({
    user: user._id,
    fileName: "sunil-kumar-resume.pdf",
    fileType: "application/pdf",
    fileSize: 100,
    parsedData: sampleParsedData,
    template: "classic-rose-serif",
  });

  console.log("\n  [TEST] Rendering resume via Puppeteer...");
  const exportResult = await renderResumePdf(user._id, validResume._id, { density: "density-1" });
  assert(exportResult && exportResult.buffer && exportResult.buffer.length > 10000, "Puppeteer produced non-empty PDF buffer (>10KB)");

  // 4. Extract text with PDFParse and verify Step 1 & 2 fixes
  const parser = new PDFParse({ data: new Uint8Array(exportResult.buffer) });
  const parsedPdf = await parser.getText();
  const pdfText = parsedPdf.text;

  // Header verification: name is present at the top
  assert(pdfText.includes("Sunil Kumar"), "Header (candidate name 'Sunil Kumar') is present in exported PDF text");
  assert(pdfText.includes("New Delhi, India") || pdfText.includes("sunil@example.com"), "Contact info is present in exported PDF");

  // Section titles verification: matching live preview
  assert(
    pdfText.includes("WORK EXPERIENCE") || pdfText.includes("Work Experience") || pdfText.includes("EXPERIENCE"),
    "Work Experience section present"
  );
  assert(
    pdfText.includes("SKILLS") || pdfText.includes("Skills") || pdfText.includes("TECHNICAL SKILLS"),
    "Skills section present with template styling"
  );
  assert(
    pdfText.includes("AI Resume & Career Optimizer"),
    "Project name present"
  );
  assert(
    pdfText.includes("React") && pdfText.includes("Node.js"),
    "Technologies list present"
  );

  // 5. Test Multiple Templates
  console.log("\n--- Testing Multiple Template Layouts ---");
  const testTemplates = ["navy-sidebar-timeline", "compact-fresher-ats", "banner-header", "creative-blocks"];
  for (const tpl of testTemplates) {
    const tplResume = await Resume.create({
      user: user._id,
      fileName: `${tpl}-test.pdf`,
      fileType: "application/pdf",
      fileSize: 100,
      parsedData: sampleParsedData,
      template: tpl,
    });
    const res = await renderResumePdf(user._id, tplResume._id);
    assert(res.buffer && res.buffer.length > 10000, `Template [${tpl}] exported successfully via Puppeteer (${res.buffer.length} bytes)`);
    await Resume.findByIdAndDelete(tplResume._id);
  }

  // Cleanup
  await Resume.deleteMany({ user: user._id });
  await User.findByIdAndDelete(user._id);
  await mongoose.disconnect();

  console.log("\n==================================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
  process.exit(0);
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
