// M9 tests — version history: snapshot on edit, no-op dedupe, restore,
// cap enforcement, ownership isolation.
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
  body: JSON.stringify({ name: "M9 Tester", email: `m9-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status);

const pdfContent = "Software Engineer\nSkills\nReact, Node.js\nExperience\nBuilt apps at TechNova\nEducation\nB.Tech";
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
const versions = () =>
  fetch(`${BASE}/resumes/${resume._id}/versions`, { headers: { cookie } }).then((r) => r.json());

// Edit 1 → version 1
await patch({ parsedData: { summary: "Version one summary" }, template: "modern" });
let v = await versions();
check("version created on edit", v.data?.versions?.length === 1, `count ${v.data?.versions?.length}`);
check("v1 is modern", v.data?.versions?.[0]?.template === "modern");
check("v1 has snapshot data", v.data?.versions?.[0]?.parsedData?.summary === "Version one summary");

// Edit 2 → version 2
await patch({ parsedData: { summary: "Version two summary" } });
v = await versions();
check("second edit → v2", v.data?.versions?.length === 2, `count ${v.data?.versions?.length}`);

// No-op save → dedupe, still 2
await patch({ parsedData: { summary: "Version two summary" } });
v = await versions();
check("no-op save deduped", v.data?.versions?.length === 2, `count ${v.data?.versions?.length}`);

// Restore v1 → resume matches v1, pre-restore snapshot added (v3)
const v1 = v.data.versions.find((version) => version.version === 1);
const restoreRes = await fetch(`${BASE}/resumes/${resume._id}/versions/${v1._id}/restore`, { method: "POST", headers: { cookie } });
const restored = await restoreRes.json();
check("restore 200", restoreRes.status === 200);
check("restored summary = v1", restored.data?.resume?.parsedData?.summary === "Version one summary", restored.data?.resume?.parsedData?.summary);
check("restored template = v1", restored.data?.resume?.template === "modern");

v = await versions();
check("restore keeps versions (undo = restore again)", v.data?.versions?.length === 2, `count ${v.data?.versions?.length}`);

// Restore again to v2 to verify undo works
const v2 = v.data.versions.find((version) => version.version === 2);
const undo = await fetch(`${BASE}/resumes/${resume._id}/versions/${v2._id}/restore`, { method: "POST", headers: { cookie } });
const undone = await undo.json();
check("undo restore → v2 state", undone.data?.resume?.parsedData?.summary === "Version two summary");

// Cap: 20 edits → at most 15 versions
for (let i = 0; i < 20; i += 1) {
  await patch({ parsedData: { summary: `Edit ${i}` } });
}
v = await versions();
const nums = v.data.versions.map((version) => version.version);
check("cap respected (≤15)", nums.length <= 15, `count ${nums.length}`);
check("oldest pruned, newest kept", Math.max(...nums) >= 20 && Math.min(...nums) > 1, `range ${Math.min(...nums)}–${Math.max(...nums)}`);
check("versions contiguous", Math.max(...nums) - Math.min(...nums) + 1 === nums.length);

// Ownership isolation
const reg2 = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "Other", email: `m9b-${Date.now()}@test.com`, password: "password123" }),
});
const cookie2 = (reg2.headers.get("set-cookie") ?? "").split(";")[0];
const crossList = await fetch(`${BASE}/resumes/${resume._id}/versions`, { headers: { cookie: cookie2 } });
check("cross-user versions 404", crossList.status === 404);
const crossRestore = await fetch(`${BASE}/resumes/${resume._id}/versions/${v1._id}/restore`, { method: "POST", headers: { cookie: cookie2 } });
check("cross-user restore 404", crossRestore.status === 404);
const badVersion = await fetch(`${BASE}/resumes/${resume._id}/versions/000000000000000000000000`, { headers: { cookie } });
check("unknown version 404", badVersion.status === 404);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
