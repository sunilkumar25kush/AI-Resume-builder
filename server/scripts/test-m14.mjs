// M14 tests — analysis expansion: result normalization with new fields
// (unit) + live optimization returns the new metrics.
import { normalizeResult } from "../src/validations/optimization.js";

const BASE = "http://localhost:5001/api";
let passed = 0;
let failed = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "  \u2713" : "  \u2717"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (ok) passed += 1;
  else failed += 1;
}

// --- Unit: normalization with new fields ---
const messy = normalizeResult({
  atsScore: "72",
  matchPercent: 140,
  keywordDensity: "55",
  missingSkills: [" React ", "React", "GraphQL"],
  matchedSkills: ["Node.js", "Node.js", " MongoDB "],
  weakBullets: [" worked on stuff ", "", "did things"],
  grammarIssues: ["  'teh' typo", "  'teh' typo"],
  formattingSuggestions: ["Use standard headings", "Use standard headings", "Add contact header"],
  keywordSuggestions: ["Add metrics", "Add metrics"],
  summary: 42,
});
check("atsScore coerced", messy.atsScore === 72);
check("matchPercent clamped", messy.matchPercent === 100);
check("keywordDensity coerced", messy.keywordDensity === 55, String(messy.keywordDensity));
check("matchedSkills deduped", JSON.stringify(messy.matchedSkills) === JSON.stringify(["Node.js", "MongoDB"]), JSON.stringify(messy.matchedSkills));
check("weakBullets cleaned", JSON.stringify(messy.weakBullets) === JSON.stringify(["worked on stuff", "did things"]));
check("grammarIssues deduped", messy.grammarIssues.length === 1);
check("formattingSuggestions deduped", messy.formattingSuggestions.length === 2);
check("missingSkills deduped", messy.missingSkills.length === 2);

const garbage = normalizeResult({ nope: true });
check("garbage → defaults", garbage.keywordDensity === 0 && garbage.matchedSkills.length === 0 && garbage.weakBullets.length === 0);

// --- Live: optimization returns new metrics ---
const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M14 Tester", email: `m14-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status);

const pdfContent = "Software Engineer\nSkills\nReact, Node.js, MongoDB\nExperience\nBuilt web apps at TechNova\nEducation\nB.Tech";
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

const jdRes = await fetch(`${BASE}/jds`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({
    text: `React Developer at TechNova\n\nSkills\nReact, TypeScript, GraphQL, MongoDB\n\nQualifications\n- 3+ years of experience\n\nResponsibilities\n- Build dashboards`,
  }),
});
const jdId = (await jdRes.json()).data?.jd?._id;
check("jd pasted", jdRes.status === 201);

console.log("  running AI analysis (Gemini, 10-60s)…");
const optRes = await fetch(`${BASE}/optimizations`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ resumeId: resume._id, jdId }),
});
const opt = (await optRes.json()).data?.optimization;
check("optimization 201", optRes.status === 201);
const r = opt?.result ?? {};
check("atsScore present", typeof r.atsScore === "number" && r.atsScore >= 0 && r.atsScore <= 100, `ats=${r.atsScore}`);
check("keywordDensity 0-100", typeof r.keywordDensity === "number" && r.keywordDensity >= 0 && r.keywordDensity <= 100, `density=${r.keywordDensity}`);
check("matchedSkills array", Array.isArray(r.matchedSkills), JSON.stringify(r.matchedSkills));
check("missingSkills array", Array.isArray(r.missingSkills));
check("weakBullets array", Array.isArray(r.weakBullets), `n=${r.weakBullets?.length}`);
check("grammarIssues array", Array.isArray(r.grammarIssues));
check("formattingSuggestions array", Array.isArray(r.formattingSuggestions), `n=${r.formattingSuggestions?.length}`);
check("matched skills really matched", r.matchedSkills?.every((s) => /react|node|mongo|typescript|graphql/i.test(s)), JSON.stringify(r.matchedSkills));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
