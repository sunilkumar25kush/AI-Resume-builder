// M8 tests — resume template persistence + reorder persistence via PATCH.
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
  body: JSON.stringify({ name: "M8 Tester", email: `m8-${Date.now()}@test.com`, password: "password123" }),
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
check("resume uploaded", upload.status === 201, resume?.template ?? "no template field");
check("default template classic", resume?.template === "classic");

const patch = (body) =>
  fetch(`${BASE}/resumes/${resume._id}`, {
    method: "PATCH",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify(body),
  });

// Template switch
const t1 = await patch({ template: "modern" });
const t1json = await t1.json();
check("template switch 200", t1.status === 200);
check("template persisted", t1json.data?.resume?.template === "modern", t1json.data?.resume?.template);

const bad = await patch({ template: "bogus" });
check("invalid template 400", bad.status === 400, String(bad.status));

// Reorder persistence: A,B → B,A
const expAB = [
  { title: "Junior Dev", company: "Alpha", location: "", startDate: "2020", endDate: "2022", description: "First" },
  { title: "Senior Dev", company: "Beta", location: "", startDate: "2022", endDate: "2024", description: "Second" },
];
const t2 = await patch({ parsedData: { experience: expAB, summary: "Engineer with 4 years of experience" } });
check("parsedData patch 200", t2.status === 200);

const t3 = await patch({ parsedData: { experience: [expAB[1], expAB[0]] } });
const t3json = await t3.json();
check("reorder patch 200", t3.status === 200);
check("reorder persisted", t3json.data?.resume?.parsedData?.experience?.[0]?.company === "Beta", JSON.stringify(t3json.data?.resume?.parsedData?.experience?.map((e) => e.company)));

// Partial patch doesn't wipe other fields
check("summary survived reorder", t3json.data?.resume?.parsedData?.summary === "Engineer with 4 years of experience");
check("template survived parsedData patch", t3json.data?.resume?.template === "modern");

// GET round-trip
const get = await fetch(`${BASE}/resumes/${resume._id}`, { headers: { cookie } });
const getJson = await get.json();
check("GET returns template", getJson.data?.resume?.template === "modern");
check("GET returns reordered", getJson.data?.resume?.parsedData?.experience?.[0]?.company === "Beta");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
