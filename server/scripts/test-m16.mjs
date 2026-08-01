// M16 tests — editor powers data: customSections + hiddenSections persist,
// generation merge preserves them.
import { mergeGeneratedData } from "../src/validations/generation.js";

const BASE = "http://localhost:5001/api";
let passed = 0;
let failed = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "  \u2713" : "  \u2717"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (ok) passed += 1;
  else failed += 1;
}

// Unit: merge preserves layout fields
const merged = mergeGeneratedData(
  { summary: "AI new summary" },
  {
    customSections: [{ title: "Publications", content: "Blog post on ATS" }],
    hiddenSections: ["awards", "languages"],
  },
);
check("merge keeps customSections", merged.customSections?.[0]?.title === "Publications");
check("merge keeps hiddenSections", JSON.stringify(merged.hiddenSections) === JSON.stringify(["awards", "languages"]));

const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M16 Tester", email: `m16-${Date.now()}@test.com`, password: "password123" }),
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

const patchRes = await fetch(`${BASE}/resumes/${resume._id}`, {
  method: "PATCH",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({
    parsedData: {
      customSections: [
        { title: "Publications", content: "Technical blog on resume parsing" },
        { title: "Volunteering", content: "Mentor at local coding club" },
      ],
      hiddenSections: ["awards", "languages", "certifications"],
    },
  }),
});
const patched = await patchRes.json();
check("patch custom+hidden 200", patchRes.status === 200);
check("customSections persisted", patched.data?.resume?.parsedData?.customSections?.length === 2, JSON.stringify(patched.data?.resume?.parsedData?.customSections?.length));
check("customSection title kept", patched.data?.resume?.parsedData?.customSections?.[0]?.title === "Publications");
check("hiddenSections persisted", JSON.stringify(patched.data?.resume?.parsedData?.hiddenSections) === JSON.stringify(["awards", "languages", "certifications"]));
check("summary survived patch", typeof patched.data?.resume?.parsedData?.summary === "string");

// Partial update: hiddenSections-only doesn't wipe customSections
const patch2 = await fetch(`${BASE}/resumes/${resume._id}`, {
  method: "PATCH",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ parsedData: { hiddenSections: ["awards"] } }),
});
const patched2 = await patch2.json();
check("hidden-only patch keeps custom", patched2.data?.resume?.parsedData?.customSections?.length === 2, `custom=${patched2.data?.resume?.parsedData?.customSections?.length}`);
check("hiddenSections replaced", JSON.stringify(patched2.data?.resume?.parsedData?.hiddenSections) === JSON.stringify(["awards"]));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
