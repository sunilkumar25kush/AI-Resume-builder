// M4 browser-path E2E via the Vite dev proxy (5173) — same origin the browser uses.
const BASE = "http://localhost:5173/api";
let cookie = "";

function buildPdf() {
  const lines = ["Test User - Software Engineer", "Email: test.user@example.com", "SKILLS", "Python, Django, PostgreSQL", "EXPERIENCE", "Software Engineer | TestCorp | Mumbai", "2021 - Present", "Built internal tools."];
  const objects = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>";
  const stream = lines.map((line, i) => `BT /F1 10 Tf 72 ${760 - i * 14} Td (${line}) Tj ET`).join("\n");
  objects[4] = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`;
  objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 1; i <= 5; i++) {
    offsets[i] = Buffer.byteLength(pdf);
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M4 Proxy", email: `m4p-${Date.now()}@test.com`, password: "password123" }),
});
cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status, cookie.startsWith("token=") ? "cookie ✓" : "cookie ✗");

const form = new FormData();
form.append("resume", new Blob([buildPdf()], { type: "application/pdf" }), "resume.pdf");
const up = await fetch(`${BASE}/resumes`, { method: "POST", body: form, headers: { cookie } });
const upJson = await up.json();
console.log("upload via proxy:", up.status, "| parsed:", upJson.data?.resume?.parsedData?.experience?.[0]?.company);
const id = upJson.data?.resume?._id;

const list = await fetch(`${BASE}/resumes`, { headers: { cookie } });
const listJson = await list.json();
console.log("list via proxy:", list.status, "| count:", listJson.data?.resumes?.length);

const patch = await fetch(`${BASE}/resumes/${id}`, {
  method: "PATCH",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ parsedData: { summary: "Proxy edited summary" } }),
});
const patchJson = await patch.json();
console.log("patch via proxy:", patch.status, "| summary:", patchJson.data?.resume?.parsedData?.summary);

const del = await fetch(`${BASE}/resumes/${id}`, { method: "DELETE", headers: { cookie } });
console.log("delete via proxy:", del.status);

const pages = ["/resumes"];
for (const p of pages) {
  const r = await fetch(`http://localhost:5173${p}`, { redirect: "manual" });
  console.log(`client ${p}:`, r.status);
}
