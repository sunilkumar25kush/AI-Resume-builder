// M13 tests — data model expansion: parser extraction (resume + JD new
// buckets), PATCH persistence, generation merge preservation.
import { normalizeResumeText } from "../src/services/resumeParser.js";
import { parseJdText } from "../src/services/jdParser.js";
import { mergeGeneratedData } from "../src/validations/generation.js";

const BASE = "http://localhost:5001/api";
let passed = 0;
let failed = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "  \u2713" : "  \u2717"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (ok) passed += 1;
  else failed += 1;
}

// --- Unit: resume parser new sections ---
const resumeText = `Rahul Sharma
rahul@test.com | +91 9876543210 | Bengaluru | linkedin.com/in/rahul

Software engineer with 5 years of experience building web apps.

SKILLS
React, Node.js, MongoDB

EXPERIENCE
Senior Engineer | TechNova | 2022 - 2024
- Built the dashboard
Technologies: React, Redux, Node.js
Achievements: Reduced page load by 40%

EDUCATION
B.Tech | IIT Delhi | 2018 - 2022

CERTIFICATIONS
AWS Certified Solutions Architect
Google Cloud Associate

LANGUAGES
English (Fluent)
Hindi (Native)

AWARDS
Employee of the Year 2023

PROJECTS
Dashboard Clone
Built a dashboard clone
Technologies: React, D3.js
Live Demo: https://demo.example.com`;
const parsed = normalizeResumeText(resumeText);
check("name extracted", parsed.name === "Rahul Sharma", parsed.name);
check("name not in summary", !parsed.summary.includes("Rahul Sharma"), parsed.summary.slice(0, 40));
check("certifications extracted", parsed.certifications.includes("AWS Certified Solutions Architect"), JSON.stringify(parsed.certifications));
check("languages extracted", parsed.languages.some((l) => l.includes("English")), JSON.stringify(parsed.languages));
check("awards extracted", parsed.awards.includes("Employee of the Year 2023"), JSON.stringify(parsed.awards));
check("exp technologies extracted", parsed.experience[0]?.technologies?.includes("React"), parsed.experience[0]?.technologies);
check("exp achievements extracted", parsed.experience[0]?.achievements?.includes("40%"), parsed.experience[0]?.achievements);
check("exp description excludes labels", !parsed.experience[0]?.description?.includes("Technologies:"), parsed.experience[0]?.description?.slice(0, 40));
check("project technologies extracted", parsed.projects[0]?.technologies?.includes("D3.js"), parsed.projects[0]?.technologies);
check("project liveDemo extracted", parsed.projects[0]?.liveDemo === "https://demo.example.com", parsed.projects[0]?.liveDemo);

// --- Unit: JD parser new buckets ---
const jdText = `Senior React Developer at Acme Corp

We are looking for a developer with 5+ years of experience.

SKILLS
React, TypeScript, GraphQL

PREFERRED SKILLS
Docker, AWS

QUALIFICATIONS
- Bachelor's degree in Computer Science
- Strong communication skills

RESPONSIBILITIES
- Build scalable dashboards
- Collaborate with cross-functional teams

KEYWORDS
React, TypeScript, GraphQL, performance optimization`;
const jd = parseJdText(jdText);
check("jd preferredSkills", jd.preferredSkills.includes("Docker"), JSON.stringify(jd.preferredSkills));
check("jd experienceRequired", jd.experienceRequired === "5+ years", jd.experienceRequired);
check("jd atsKeywords from section", jd.atsKeywords.includes("performance optimization"), JSON.stringify(jd.atsKeywords));
check("jd softSkills scanned", jd.softSkills.some((s) => /communication/i.test(s)), JSON.stringify(jd.softSkills));

// --- Unit: generation merge preserves new fields ---
const merged = mergeGeneratedData(
  { summary: "AI summary" },
  {
    name: "Rahul Sharma",
    certifications: ["AWS"],
    languages: ["English"],
    awards: ["Award X"],
  },
);
check("merge keeps name", merged.name === "Rahul Sharma");
check("merge keeps certifications", merged.certifications.includes("AWS"));
check("merge keeps languages", merged.languages.includes("English"));
check("merge keeps awards", merged.awards.includes("Award X"));

// --- Live: PATCH persistence + JD create with new fields ---
const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M13 Tester", email: `m13-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status);

const pdfContent = `Rahul Sharma\nrahul@test.com | Bengaluru\n\nSkills\nReact, Node.js\n\nExperience\nDev | TechNova | 2020 - 2023\nBuilt stuff\n\nEducation\nB.Tech | IIT Delhi | 2016 - 2020\n\nCertifications\nAWS Certified\n\nLanguages\nEnglish (Fluent)\n\nAwards\nBest Dev 2022`;
const sep = ") Tj 0 -14 Td (";
const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
  `<< /Length 130 >> stream\nBT /F1 12 Tf 50 700 Td 14 TL (${pdfContent.replace(/\n/g, sep)}) Tj ET\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
];
let pdf = "%PDF-1.4\n";
const offsets = [];
for (const obj of objects) {
  offsets.push(pdf.length);
  pdf += `${objects.indexOf(obj) + 1} 0 obj\n${obj}\nendobj\n`;
}
const xrefPos = pdf.length;
pdf += `xref\n0 6\n0000000000 65535 f \n`;
for (const off of offsets) pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

const form = new FormData();
form.append("resume", new Blob([pdf], { type: "application/pdf" }), "resume.pdf");
const upload = await fetch(`${BASE}/resumes`, { method: "POST", headers: { cookie }, body: form });
const resume = (await upload.json()).data?.resume;
check("resume uploaded", upload.status === 201);
check("name parsed from upload", resume.parsedData?.name === "Rahul Sharma", resume.parsedData?.name);
check("certifications parsed", resume.parsedData?.certifications?.includes("AWS Certified"), JSON.stringify(resume.parsedData?.certifications));
check("languages parsed", resume.parsedData?.languages?.some((l) => l.includes("English")));

// PATCH with new fields
const patchRes = await fetch(`${BASE}/resumes/${resume._id}`, {
  method: "PATCH",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({
    parsedData: {
      name: "Rahul Kumar Sharma",
      certifications: ["AWS Certified", "Google Cloud"],
      languages: ["English (Fluent)", "Hindi (Native)", "Spanish"],
      awards: ["Best Dev 2022", "Hackathon Winner"],
      experience: [{ title: "Dev", company: "TechNova", location: "", startDate: "2020", endDate: "2023", description: "Built stuff", achievements: "Cut costs 30%", technologies: "React, Node" }],
      projects: [{ name: "App", description: "desc", link: "https://github.com/x", technologies: "React", liveDemo: "https://app.example.com" }],
    },
  }),
});
const patched = await patchRes.json();
check("patch new fields 200", patchRes.status === 200);
check("name persisted", patched.data?.resume?.parsedData?.name === "Rahul Kumar Sharma");
check("certifications persisted", patched.data?.resume?.parsedData?.certifications?.length === 2);
check("languages persisted", patched.data?.resume?.parsedData?.languages?.includes("Spanish"));
check("awards persisted", patched.data?.resume?.parsedData?.awards?.includes("Hackathon Winner"));
check("exp achievements persisted", patched.data?.resume?.parsedData?.experience?.[0]?.achievements === "Cut costs 30%");
check("exp technologies persisted", patched.data?.resume?.parsedData?.experience?.[0]?.technologies === "React, Node");
check("project liveDemo persisted", patched.data?.resume?.parsedData?.projects?.[0]?.liveDemo === "https://app.example.com");

// JD paste with new buckets
const jdRes = await fetch(`${BASE}/jds`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ text: jdText }),
});
const jdDoc = (await jdRes.json()).data?.jd;
check("jd created 201", jdRes.status === 201);
check("jd preferredSkills saved", jdDoc?.preferredSkills?.includes("Docker"), JSON.stringify(jdDoc?.preferredSkills));
check("jd experienceRequired saved", jdDoc?.experienceRequired === "5+ years", jdDoc?.experienceRequired);
check("jd softSkills saved", jdDoc?.softSkills?.length >= 1);
check("jd atsKeywords saved", jdDoc?.atsKeywords?.includes("performance optimization"));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
