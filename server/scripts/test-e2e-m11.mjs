// M11 browser-path E2E via the Vite dev proxy — AI generation flow.
const BASE = "http://localhost:5173/api";

const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M11 Proxy", email: `m11p-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status);

const pdfContent = "Frontend Engineer\nSkills\nReact, TypeScript\nExperience\nBuilt dashboards at TechNova";
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
console.log("upload via proxy:", upload.status);

const jd = await fetch(`${BASE}/jds`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ text: `React Developer\n\nSkills\nReact, TypeScript, GraphQL\n\nQualifications\n- 3+ years React\n\nResponsibilities\n- Build dashboards` }),
});
const jdId = (await jd.json()).data?.jd?._id;
console.log("jd via proxy:", jd.status);

console.log("running AI generation via proxy (30-150s)…");
const start = Date.now();
const gen = await fetch(`${BASE}/resumes/${resume._id}/generate`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ jdId }),
});
const genJson = await gen.json();
const generated = genJson.data?.resume;
console.log(
  "generate via proxy:",
  gen.status,
  `| ${((Date.now() - start) / 1000).toFixed(1)}s`,
  "| new id:",
  generated?._id !== resume._id,
  "| summary:",
  generated?.parsedData?.summary?.slice(0, 50),
  "| exp company:",
  JSON.stringify(generated?.parsedData?.experience?.[0]?.company),
);

for (const p of ["/resumes", `/resumes/${generated?._id}`, `/resumes/${generated?._id}/edit`, "/optimize"]) {
  const r = await fetch(`http://localhost:5173${p}`, { redirect: "manual" });
  console.log(`client ${p}:`, r.status);
}
