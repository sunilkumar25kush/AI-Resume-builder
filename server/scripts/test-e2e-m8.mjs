// M8 browser-path E2E via the Vite dev proxy — upload, autosave-style PATCH
// (parsedData + template), reorder persistence, editor route reachable.
const BASE = "http://localhost:5173/api";

const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M8 Proxy", email: `m8p-${Date.now()}@test.com`, password: "password123" }),
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
console.log("upload via proxy:", upload.status, "| template:", resume?.template);

// Autosave simulation: parsedData + template in one PATCH (like the editor).
const save = await fetch(`${BASE}/resumes/${resume._id}`, {
  method: "PATCH",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({
    parsedData: {
      summary: "Frontend engineer with 4 years of experience",
      skills: ["React", "TypeScript", "GraphQL"],
      experience: [
        { title: "Senior Dev", company: "Beta", location: "", startDate: "2022", endDate: "2024", description: "Led UI" },
        { title: "Junior Dev", company: "Alpha", location: "", startDate: "2020", endDate: "2022", description: "Built UI" },
      ],
    },
    template: "modern",
  }),
});
const saved = await save.json();
const exp = saved.data?.resume?.parsedData?.experience ?? [];
console.log("autosave PATCH:", save.status, "| template:", saved.data?.resume?.template, "| exp0:", exp[0]?.company, "| summary:", saved.data?.resume?.parsedData?.summary?.slice(0, 20));

// Reorder-only PATCH (drag & drop persistence path).
const reorder = await fetch(`${BASE}/resumes/${resume._id}`, {
  method: "PATCH",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ parsedData: { experience: [exp[1], exp[0]] } }),
});
const reordered = await reorder.json();
const exp2 = reordered.data?.resume?.parsedData?.experience ?? [];
console.log(
  "reorder PATCH:",
  reorder.status,
  "| exp0:",
  exp2[0]?.company,
  "| summary intact:",
  reordered.data?.resume?.parsedData?.summary?.slice(0, 20),
  "| template intact:",
  reordered.data?.resume?.template,
);

for (const p of ["/resumes", `/resumes/${resume._id}`, `/resumes/${resume._id}/edit`]) {
  const r = await fetch(`http://localhost:5173${p}`, { redirect: "manual" });
  console.log(`client ${p}:`, r.status);
}
