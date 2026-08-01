// M17 tests — version duplicate endpoint.
const BASE = "http://localhost:5001/api";
let passed = 0;
let failed = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "  \u2713" : "  \u2717"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (ok) passed += 1;
  else failed += 1;
}

const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M17 Tester", email: `m17-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status);

const pdfContent = "Rahul Sharma\nrahul@test.com\n\nSkills\nReact\n\nExperience\nDev | TechNova | 2020 - 2023\nBuilt stuff";
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

const patch = (body) =>
  fetch(`${BASE}/resumes/${resume._id}`, {
    method: "PATCH",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
await patch({ parsedData: { summary: "Version one" } });
await patch({ parsedData: { summary: "Version two" } });

const list = await fetch(`${BASE}/resumes/${resume._id}/versions`, { headers: { cookie } });
const versions = (await list.json()).data?.versions ?? [];
check("two versions exist", versions.length === 2);

const v1 = versions.find((v) => v.version === 1);
const dup = await fetch(`${BASE}/resumes/${resume._id}/versions/${v1._id}/duplicate`, { method: "POST", headers: { cookie } });
const dupJson = await dup.json();
check("duplicate 201", dup.status === 201, String(dup.status));
check("duplicate is new version", dupJson.data?.version?.version === 3, `v${dupJson.data?.version?.version}`);
check("duplicate copies content", dupJson.data?.version?.parsedData?.summary === "Version one", dupJson.data?.version?.parsedData?.summary);

const list2 = await fetch(`${BASE}/resumes/${resume._id}/versions`, { headers: { cookie } });
const versions2 = (await list2.json()).data?.versions ?? [];
check("list now 3 versions", versions2.length === 3, String(versions2.length));

const reg2 = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "Other", email: `m17b-${Date.now()}@test.com`, password: "password123" }),
});
const cookie2 = (reg2.headers.get("set-cookie") ?? "").split(";")[0];
const cross = await fetch(`${BASE}/resumes/${resume._id}/versions/${v1._id}/duplicate`, { method: "POST", headers: { cookie: cookie2 } });
check("cross-user duplicate 404", cross.status === 404);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
