// M7 browser-path E2E via the Vite dev proxy (5173) — register, upload resume,
// paste JD, run a REAL AI optimization, view result, delete.
const BASE = "http://localhost:5173/api";

const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M7 Proxy", email: `m7p-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status);

const pdfContent = "Frontend Engineer\nSkills\nReact, TypeScript, Node.js\nExperience\nBuilt dashboards at TechNova";
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
console.log("resume upload via proxy:", upload.status, Boolean(resumeId));

const jd = await fetch(`${BASE}/jds`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({
    text: `React Developer at TechNova\n\nSkills\nReact, TypeScript, GraphQL\n\nQualifications\n- 3+ years of React experience`,
  }),
});
const jdId = (await jd.json()).data?.jd?._id;
console.log("jd paste via proxy:", jd.status, Boolean(jdId));

console.log("running AI optimization via proxy (may take 30-120s)…");
const start = Date.now();
const opt = await fetch(`${BASE}/optimizations`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ resumeId, jdId }),
});
const optJson = await opt.json();
const id = optJson.data?.optimization?._id;
console.log(
  "optimize via proxy:",
  opt.status,
  `| ${((Date.now() - start) / 1000).toFixed(1)}s`,
  "| ats:",
  optJson.data?.optimization?.result?.atsScore,
  "| match:",
  optJson.data?.optimization?.result?.matchPercent,
);

const list = await fetch(`${BASE}/optimizations`, { headers: { cookie } });
console.log("list via proxy:", list.status, "| count:", (await list.json()).data?.optimizations?.length);

const del = await fetch(`${BASE}/optimizations/${id}`, { method: "DELETE", headers: { cookie } });
console.log("delete via proxy:", del.status);

for (const p of ["/optimize", "/optimize/someid"]) {
  const r = await fetch(`http://localhost:5173${p}`, { redirect: "manual" });
  console.log(`client ${p}:`, r.status);
}
