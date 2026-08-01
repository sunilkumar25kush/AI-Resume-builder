// M13 browser-path E2E via the Vite dev proxy — new fields round-trip.
const BASE = "http://localhost:5173/api";

const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M13 Proxy", email: `m13p-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status);

const pdfContent = `Rahul Sharma\nrahul@test.com | Bengaluru\n\nSkills\nReact, Node.js\n\nExperience\nDev | TechNova | 2020 - 2023\nBuilt stuff\nTechnologies: React, Node\nAchievements: Cut costs 30%\n\nEducation\nB.Tech | IIT Delhi | 2016 - 2020\n\nCertifications\nAWS Certified\n\nLanguages\nEnglish (Fluent)\n\nAwards\nBest Dev 2022`;
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
console.log("upload via proxy:", upload.status, "| name:", resume?.parsedData?.name, "| certs:", resume?.parsedData?.certifications?.length, "| exp tech:", resume?.parsedData?.experience?.[0]?.technologies);

const jd = await fetch(`${BASE}/jds`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ text: `Senior React Developer at Acme\n\nSkills\nReact, TypeScript\n\nPreferred Skills\nDocker\n\nWe need 5+ years of experience\n\nQualifications\n- Bachelor's degree\n- Strong communication\n\nResponsibilities\n- Build dashboards` }),
});
const jdDoc = (await jd.json()).data?.jd;
console.log("jd via proxy:", jd.status, "| preferred:", jdDoc?.preferredSkills?.length, "| expReq:", jdDoc?.experienceRequired, "| soft:", jdDoc?.softSkills?.length);

for (const p of ["/resumes", `/resumes/${resume._id}`, `/resumes/${resume._id}/edit`, "/jds", `/jds/${jdDoc?._id}`, `/jds/${jdDoc?._id}/edit`]) {
  const r = await fetch(`http://localhost:5173${p}`, { redirect: "manual" });
  console.log(`client ${p}:`, r.status);
}
