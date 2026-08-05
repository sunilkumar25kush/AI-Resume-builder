// M7 tests — optimizer: result normalization (unit) + live AI run via the API.
import { buildOptimizePrompt } from "../src/services/ai/prompts.js";
import { normalizeResult } from "../src/validations/optimization.js";

const BASE = "http://localhost:5001/api";
let passed = 0;
let failed = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "  \u2713" : "  \u2717"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (ok) passed += 1;
  else failed += 1;
}

// --- Unit: result normalization ---
const messy = normalizeResult({
  atsScore: "87",
  matchPercent: 150,
  missingSkills: [" React ", "React", "", "Node.js", "  "],
  keywordSuggestions: ["Add metrics", "Add metrics"],
  summary: 42,
});
check("string score coerced", messy.atsScore === 87);
check("over-100 match clamped", messy.matchPercent === 100, String(messy.matchPercent));
check("skills trimmed+deduped", JSON.stringify(messy.missingSkills) === JSON.stringify(["React", "Node.js"]));
check("suggestions deduped", messy.keywordSuggestions.length === 1);
check("bad summary defaulted", typeof messy.summary === "string");

const garbage = normalizeResult({ nope: true });
check("garbage → zero defaults", garbage.atsScore === 0 && garbage.matchPercent === 0 && garbage.missingSkills.length === 0);

const prompt = buildOptimizePrompt({
  resume: { skills: ["React"], contact: { email: "a@b.c" } },
  jd: { title: "React Dev", skills: ["React", "GraphQL"] },
});
check("prompt contains resume json", prompt.includes("a@b.c") && prompt.includes("React"));
check("prompt contains jd json", prompt.includes("GraphQL"));

// --- Live: full flow with a real Gemini call ---
const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M7 Tester", email: `m7-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status);

// Minimal hand-built PDF (same trick as test-m4).
const pdfContent = `Software Engineer\nSkills\nReact, Node.js, Python\nExperience\nBuilt web apps at TechNova\nEducation\nB.Tech Computer Science`;
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
const resumeId = (await upload.json()).data?.resume?._id;
check("resume uploaded", upload.status === 201 && Boolean(resumeId));

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
check("jd pasted", jdRes.status === 201 && Boolean(jdId));

console.log("  running AI optimization (Gemini, 10-60s)…");
const start = Date.now();
const optRes = await fetch(`${BASE}/optimizations`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ resumeId, jdId }),
});
const optJson = await optRes.json();
const opt = optJson.data?.optimization;
const elapsed = ((Date.now() - start) / 1000).toFixed(1);
check("optimization 201", optRes.status === 201, `status ${optRes.status} (${elapsed}s)`);
check("result atsScore 0-100", typeof opt?.result?.atsScore === "number" && opt.result.atsScore >= 0 && opt.result.atsScore <= 100, `ats=${opt?.result?.atsScore}`);
check("result matchPercent 0-100", opt?.result?.matchPercent >= 0 && opt?.result?.matchPercent <= 100, `match=${opt?.result?.matchPercent}`);
check("missingSkills array", Array.isArray(opt?.result?.missingSkills));
check("keywordSuggestions array", Array.isArray(opt?.result?.keywordSuggestions));
check("summary string", typeof opt?.result?.summary === "string", `"${(opt?.result?.summary ?? "").slice(0, 40)}"`);
check("snapshot titles stored", Boolean(opt?.resumeTitle) && Boolean(opt?.jdTitle), `${opt?.resumeTitle} / ${opt?.jdTitle}`);

const listRes = await fetch(`${BASE}/optimizations`, { headers: { cookie } });
const listJson = await listRes.json();
check("list has run", listJson.data?.optimizations?.length >= 1);

const getRes = await fetch(`${BASE}/optimizations/${opt?._id}`, { headers: { cookie } });
check("get 200", getRes.status === 200);

// Ownership isolation
const reg2 = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "Other", email: `m7b-${Date.now()}@test.com`, password: "password123" }),
});
const cookie2 = (reg2.headers.get("set-cookie") ?? "").split(";")[0];
const otherList = await fetch(`${BASE}/optimizations`, { headers: { cookie: cookie2 } });
check("other user sees 0", (await otherList.json()).data?.optimizations?.length === 0);
const crossGet = await fetch(`${BASE}/optimizations/${opt?._id}`, { headers: { cookie: cookie2 } });
check("cross-user get 404", crossGet.status === 404);

const delRes = await fetch(`${BASE}/optimizations/${opt?._id}`, { method: "DELETE", headers: { cookie } });
check("delete 200", delRes.status === 200);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
