// M11 tests — AI resume generation: prompt unit, merge fallback, live
// generation (truth preservation), ownership isolation, validation.
import { buildGenerationPrompt } from "../src/services/ai/prompts.js";
import { mergeGeneratedData } from "../src/validations/generation.js";

const BASE = "http://localhost:5001/api";
let passed = 0;
let failed = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "  \u2713" : "  \u2717"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (ok) passed += 1;
  else failed += 1;
}

// --- Unit: prompt + merge ---
const prompt = buildGenerationPrompt({
  resume: { summary: "Engineer", skills: ["React"], experience: [{ title: "Dev", company: "TechNova", description: "old text" }] },
  jd: { title: "React Dev", skills: ["React", "GraphQL"] },
});
check("generation prompt has truth rules", prompt.includes("NEVER invent") && prompt.includes("verbatim"));
check("generation prompt has resume json", prompt.includes("TechNova"));
check("generation prompt has jd json", prompt.includes("GraphQL"));

const original = {
  summary: "Original summary",
  contact: { email: "a@b.c", phone: "", location: "Delhi", linkedin: "", github: "" },
  skills: ["React", "Node.js"],
  experience: [{ title: "Dev", company: "TechNova", location: "", startDate: "2020", endDate: "2022", description: "old" }],
  education: [
    { degree: "B.Tech", institution: "IIT Delhi", startDate: "2015", endDate: "2019", description: "original edu text" },
    { degree: "M.Tech", institution: "IIT Bombay", startDate: "2019", endDate: "2021", description: "second edu" },
  ],
  projects: [],
};
const merged = mergeGeneratedData(
  {
    summary: "New AI summary",
    contact: { email: "hacker@evil.com", phone: "12345", location: "Mumbai" },
    skills: ["React", "GraphQL", "Node.js"],
    education: [
      { degree: "B.Tech", institution: "Harvard University", startDate: "2000", endDate: "2004", description: "AI rewrote edu" },
    ],
  },
  original,
);
check("AI summary wins", merged.summary === "New AI summary", merged.summary);
check("contact NEVER from AI", merged.contact.email === "a@b.c" && merged.contact.phone === "" && merged.contact.location === "Delhi", JSON.stringify(merged.contact));
check("invented skill dropped", JSON.stringify(merged.skills) === JSON.stringify(["React", "Node.js"]), JSON.stringify(merged.skills));
check("invented institution rejected", merged.education[0].institution === "IIT Delhi", merged.education[0].institution);
check("invented dates rejected", merged.education[0].startDate === "2015" && merged.education[0].endDate === "2019");
check("AI description rewrite kept", merged.education[0].description === "AI rewrote edu");
check("dropped entry padded from original", merged.education.length === 2 && merged.education[1].institution === "IIT Bombay", `${merged.education.length} entries`);
check("experience facts kept, description rewritten", merged.experience[0].company === "TechNova" && merged.experience[0].description === "old", merged.experience[0].description);

const empty = mergeGeneratedData({ nope: true }, original);
check("garbage AI → full fallback", empty.summary === "Original summary" && empty.experience[0].company === "TechNova");

// --- Live: full generation flow ---
const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M11 Tester", email: `m11-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status);

const pdfContent = "Software Engineer\nSkills\nReact, Node.js, Python\nExperience\nBuilt web apps at TechNova\nEducation\nB.Tech Computer Science";
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
check("original has experience", resume.parsedData?.experience?.length >= 1, `${resume.parsedData?.experience?.length} entries`);

// Set a distinctive summary + template so we can verify inheritance later.
const patchRes = await fetch(`${BASE}/resumes/${resume._id}`, {
  method: "PATCH",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ parsedData: { summary: "Original summary text to be rewritten" }, template: "modern" }),
});
check("prep patch 200", patchRes.status === 200);

const jdText = `React Developer at TechNova

Responsibilities
- Build and maintain the company dashboard
- Optimize page load times

Qualifications
- 3+ years of experience with React
- Strong knowledge of TypeScript

Skills
React, TypeScript, Node.js, GraphQL`;
const jdRes = await fetch(`${BASE}/jds`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ text: jdText }),
});
const jdId = (await jdRes.json()).data?.jd?._id;
check("jd pasted", jdRes.status === 201);

console.log("  running AI generation (Gemini, 10-60s)…");
const start = Date.now();
const genRes = await fetch(`${BASE}/resumes/${resume._id}/generate`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ jdId }),
});
const genJson = await genRes.json();
const gen = genJson.data?.resume;
const elapsed = ((Date.now() - start) / 1000).toFixed(1);
check("generate 201", genRes.status === 201, `status ${genRes.status} (${elapsed}s)`);
check("saved as NEW resume", gen?._id !== resume._id);
check("file name marked ai-optimized", gen?.fileName?.includes("ai-optimized"), gen?.fileName);
check("template inherited", gen?.template === "modern", gen?.template);
check("summary rewritten by AI", typeof gen?.parsedData?.summary === "string" && gen.parsedData.summary.length > 0, gen?.parsedData?.summary?.slice(0, 50));
check("summary differs from original", gen?.parsedData?.summary !== "Original summary text to be rewritten");
const origExp = resume.parsedData?.experience?.[0] ?? {};
const genExp = gen?.parsedData?.experience?.[0] ?? {};
check(
  "experience facts match original",
  genExp.company === origExp.company && genExp.title === origExp.title && genExp.startDate === origExp.startDate && genExp.endDate === origExp.endDate,
  `gen=${JSON.stringify([genExp.company, genExp.title])} orig=${JSON.stringify([origExp.company, origExp.title])}`,
);
check("experience description present", typeof genExp.description === "string" && genExp.description.length > 0, genExp.description?.slice(0, 40));
check(
  "education preserved",
  gen?.parsedData?.education?.length === resume.parsedData?.education?.length,
  `gen=${gen?.parsedData?.education?.length} orig=${resume.parsedData?.education?.length} genSample=${JSON.stringify(gen?.parsedData?.education?.slice(0, 1))}`,
);
check("skills preserved", gen?.parsedData?.skills?.length >= 1);

// Original untouched
const origGet = await fetch(`${BASE}/resumes/${resume._id}`, { headers: { cookie } });
const origJson = await origGet.json();
check("original summary untouched", origJson.data?.resume?.parsedData?.summary === "Original summary text to be rewritten");

// Ownership + validation
const reg2 = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "Other", email: `m11b-${Date.now()}@test.com`, password: "password123" }),
});
const cookie2 = (reg2.headers.get("set-cookie") ?? "").split(";")[0];
const cross = await fetch(`${BASE}/resumes/${resume._id}/generate`, {
  method: "POST",
  headers: { cookie: cookie2, "content-type": "application/json" },
  body: JSON.stringify({ jdId }),
});
check("cross-user generate 404", cross.status === 404);
const noBody = await fetch(`${BASE}/resumes/${resume._id}/generate`, { method: "POST", headers: { cookie } });
check("missing jdId 400", noBody.status === 400);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
