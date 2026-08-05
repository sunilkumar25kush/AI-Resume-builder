// W3 — strict match metrics: the AI can never inflate scores or invent
// matches. Unit tests on computeMatchMetrics (deterministic) + one live
// API scenario: totally unrelated resume vs JD must score 0%.
import { computeMatchMetrics } from "../src/services/optimizer.service.js";

let passed = 0;
let failed = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "  \u2713" : "  \u2717"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (ok) passed += 1;
  else failed += 1;
}

// ---------- Unit: the user's exact complaint ----------
const marketingResume = {
  summary: "Digital marketing specialist with SEO and PPC expertise",
  skills: ["SEO", "Google Ads", "Social Media Marketing", "Content Writing", "Analytics"],
  experience: [{ title: "Marketing Executive", company: "AdVista", description: "Ran ad campaigns" }],
  projects: [{ name: "Brand growth", description: "Organic reach campaigns" }],
};
const javaJd = {
  skills: ["Java", "Spring Boot", "Hibernate", "MySQL", "OOP"],
  atsKeywords: ["Java", "Spring Boot", "Hibernate", "MySQL", "JDBC", "Multithreading"],
};
const javaMetrics = computeMatchMetrics({ resume: marketingResume, jd: javaJd });
check("unrelated resume: matchPercent 0", javaMetrics.matchPercent === 0, `${javaMetrics.matchPercent}%`);
check("unrelated resume: no matched skills", javaMetrics.matchedSkills.length === 0, JSON.stringify(javaMetrics.matchedSkills));
check("unrelated resume: all JD skills missing", javaMetrics.missingSkills.length === 5, String(javaMetrics.missingSkills.length));
check("unrelated resume: atsScore 0", javaMetrics.atsScore === 0, `ats=${javaMetrics.atsScore}`);
check("unrelated resume: keywordDensity 0", javaMetrics.keywordDensity === 0, `${javaMetrics.keywordDensity}%`);

// ---------- Unit: honest positive case ----------
const reactResume = {
  summary: "React developer",
  skills: ["React", "TypeScript", "GraphQL", "MongoDB"],
  experience: [{ title: "Frontend Dev", company: "TechNova", description: "Dashboards" }],
  projects: [{ name: "Portal", description: "React dashboard" }],
};
const reactJd = {
  skills: ["React", "TypeScript", "GraphQL", "MongoDB", "Node.js"],
  atsKeywords: ["React", "TypeScript", "GraphQL", "Node.js"],
};
const reactMetrics = computeMatchMetrics({ resume: reactResume, jd: reactJd });
check("matching resume: matchPercent > 0", reactMetrics.matchPercent === 80, `${reactMetrics.matchPercent}%`);
check("matched skills are real intersection", reactMetrics.matchedSkills.length === 4 && reactMetrics.matchedSkills.every((s) => reactJd.skills.includes(s)), JSON.stringify(reactMetrics.matchedSkills));
check("missing is exactly the gap", reactMetrics.missingSkills.length === 1 && reactMetrics.missingSkills[0] === "Node.js", JSON.stringify(reactMetrics.missingSkills));
check("positive atsScore", reactMetrics.atsScore > 0, `ats=${reactMetrics.atsScore}`);

// ---------- Unit: no subword false positives ----------
const gitResume = { skills: ["GitHub"], summary: "", experience: [], projects: [] };
const gitMetrics = computeMatchMetrics({ resume: gitResume, jd: { skills: ["Git"], atsKeywords: ["Git"] } });
check("Git never matches GitHub", gitMetrics.matchedSkills.length === 0 && gitMetrics.keywordDensity === 0, JSON.stringify(gitMetrics));

const javaScriptResume = { skills: ["JavaScript"], summary: "", experience: [], projects: [] };
const jsMetrics = computeMatchMetrics({ resume: javaScriptResume, jd: { skills: ["Java"], atsKeywords: ["Java"] } });
check("Java never matches JavaScript", jsMetrics.matchedSkills.length === 0, JSON.stringify(jsMetrics));

const cppResume = { skills: ["C++", "C#"], summary: "", experience: [], projects: [] };
const cppMetrics = computeMatchMetrics({ resume: cppResume, jd: { skills: ["C++", "C#"], atsKeywords: [] } });
check("C++/C# match exactly", cppMetrics.matchedSkills.length === 2, JSON.stringify(cppMetrics.matchedSkills));

const caseResume = { skills: ["React"], summary: "", experience: [], projects: [] };
const caseMetrics = computeMatchMetrics({ resume: caseResume, jd: { skills: ["react"], atsKeywords: ["REACT"] } });
check("case-insensitive match", caseMetrics.matchedSkills.length === 1 && caseMetrics.keywordDensity === 100, JSON.stringify(caseMetrics));

// ---------- Live API: end-to-end through the server ----------
const BASE = "http://localhost:5001/api";
const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "W3 Tester", email: `w3-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
check("register", reg.status === 201, String(reg.status));

const pdfContent = "Digital Marketing Specialist\nSkills\nSEO, Google Ads, Social Media Marketing, Content Writing, Analytics\nExperience\nMarketing Executive at AdVista\nEducation\nMBA Marketing";
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
form.append("resume", new Blob([pdf], { type: "application/pdf" }), "marketing.pdf");
const upload = await fetch(`${BASE}/resumes`, { method: "POST", headers: { cookie }, body: form });
const resume = (await upload.json()).data?.resume;
check("marketing resume uploaded", upload.status === 201, String(upload.status));
check("marketing skills parsed", Array.isArray(resume?.parsedData?.skills) && resume.parsedData.skills.length >= 4, JSON.stringify(resume?.parsedData?.skills));

const jdRes = await fetch(`${BASE}/jds`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({
    text: `Java Trainer at CodeCampus

Responsibilities
- Teach core Java, Spring Boot and Hibernate
- Build training exercises with MySQL and JDBC
- Explain OOP concepts to students

Required Skills
Java, Spring Boot, Hibernate, MySQL, OOP`,
  }),
});
const jd = (await jdRes.json()).data?.jd;
check("java JD pasted", jdRes.status === 201, String(jdRes.status));

console.log("  running live AI analysis (Gemini, 10-60s)…");
const optRes = await fetch(`${BASE}/optimizations`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ resumeId: resume._id, jdId: jd._id }),
});
const result = (await optRes.json()).data?.optimization?.result ?? {};
check("live: optimization 201", optRes.status === 201, String(optRes.status));
check("live: matchPercent 0 for unrelated", result.matchPercent === 0, `${result.matchPercent}%`);
check("live: no invented matched skills", Array.isArray(result.matchedSkills) && result.matchedSkills.length === 0, JSON.stringify(result.matchedSkills));
check("live: all JD skills listed as missing", result.missingSkills?.length >= 5, `n=${result.missingSkills?.length}`);
check("live: atsScore 0", result.atsScore === 0, `ats=${result.atsScore}`);
check("live: keywordDensity 0", result.keywordDensity === 0, `${result.keywordDensity}%`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
