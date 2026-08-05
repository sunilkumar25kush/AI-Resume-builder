/* E2E test v2: ATS checker + scratch builder (Module C) — AI-free (upload path). */
import { writeFileSync, unlinkSync } from "node:fs";

const BASE = "http://localhost:5001/api";
const email = `ats-${Date.now()}@test.local`;

async function req(method, path, body, cookie) {
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  return { status: res.status, data, setCookie: res.headers.get("set-cookie") };
}

const step = (n, name) => process.stdout.write(`${n}) ${name.padEnd(42)} `);
let fail = 0;
const check = (ok, msg) => {
  console.log(ok ? "OK ✓" : `FAIL ✗ ${msg}`);
  if (!ok) fail += 1;
};

// Minimal valid PDF with resume text (Helvetica, one page)
const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 260>>stream
BT /F1 12 Tf 72 720 Td (Sunil Kumar - React Developer. Skills: React, JavaScript, TypeScript, Redux, HTML, CSS, Jest.) Tj
0 -20 Td (Built dashboards for fintech startup. Improved load time by 40 percent.) Tj
0 -20 Td (Education: B.Tech Computer Science. Email: sunil@test.com Phone: 9999999999) Tj
0 -20 Td (Led team of 3 developers. Created reusable components.) Tj ET
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
trailer<</Root 1 0 R/Size 6>>
%%EOF
`;

const pdfPath = `${process.cwd()}/server/scripts/tmp-ats-resume.pdf`;
writeFileSync(pdfPath, pdf);

// 1) Register
step(1, "register");
let r = await req("POST", "/auth/register", { name: "ATS Tester", email, password: "Test@12345" });
const cookie = r.setCookie ? r.setCookie.split(";")[0] : null;
check(r.status === 201 && cookie, `expected 201+cookie got ${r.status}`);
if (!cookie) process.exit(1);

// 2) Upload resume (multipart)
step(2, "upload resume (PDF)");
{
  const form = new FormData();
  form.append("resume", new Blob([pdf], { type: "application/pdf" }), "ats-resume.pdf");
  const res = await fetch(`${BASE}/resumes`, { method: "POST", headers: { Cookie: cookie }, body: form });
  const data = await res.json();
  r = { status: res.status, data };
}
const resumeId = r.data?.data?.resume?._id;
check(r.status === 201 && resumeId, `expected 201 got ${r.status}`);
if (!resumeId) process.exit(1);

// 3) Create JD
step(3, "create JD");
r = await req("POST", "/jds/", { text: "React Developer at Fintech Startup, Bangalore. React, TypeScript, Redux, Tailwind CSS, REST API, Jest, GitHub Actions, MySQL." }, cookie);
const jdId = r.data?.data?.jd?._id;
check(r.status === 201 && jdId, `expected 201 got ${r.status}`);

// 4) ATS check — structure only
step(4, "ats check (structure only)");
r = await req("POST", "/ats/check", { resumeId }, cookie);
const report = r.data?.data;
check(
  r.status === 200 && report && typeof report.atsScore === "number" && Array.isArray(report.checklist) && report.checklist.length >= 5,
  `expected score+checklist got ${r.status}`,
);
if (report) console.log(`      score=${report.atsScore} structure=${report.structureScore} words=${report.totalWords} checks=${report.checklist.length}`);

// 5) ATS check — with JD match
step(5, "ats check (with JD)");
r = await req("POST", "/ats/check", { resumeId, jdId }, cookie);
const withJd = r.data?.data;
check(r.status === 200 && withJd && typeof withJd.matchPercent === "number" && Array.isArray(withJd.missingSkills), `expected match got ${r.status}`);
if (withJd) console.log(`      match=${withJd.matchPercent}% missing=${withJd.missingSkills.length} (React, Jest... expected)`);

// 6) ATS check — pasted JD text
step(6, "ats check (pasted JD)");
r = await req("POST", "/ats/check", { resumeId, jdText: "Java Trainer needed. Core Java, OOP, SQL, JUnit, communication skills." }, cookie);
check(r.status === 200 && typeof r.data?.data?.atsScore === "number", `expected 200 got ${r.status}`);

// 7) Scratch builder — blank resume with prefill
step(7, "create blank resume (prefill)");
r = await req("POST", "/resumes/blank", { template: "modern" }, cookie);
const blank = r.data?.data?.resume;
check(
  r.status === 201 && blank && blank.template === "modern" && blank.parsedData?.name === "ATS Tester" && blank.parsedData?.contact?.email === email,
  `expected prefill got ${r.status}`,
);

// 8) Blank — invalid template
step(8, "blank validation (bad template)");
r = await req("POST", "/resumes/blank", { template: "nope" }, cookie);
check(r.status === 400, `expected 400 got ${r.status}`);

// 9) Validation — missing resumeId
step(9, "ats validation (no resumeId)");
r = await req("POST", "/ats/check", {}, cookie);
check(r.status === 400, `expected 400 got ${r.status}`);

try { unlinkSync(pdfPath); } catch { /* ignore */ }
console.log(fail === 0 ? "\nALL ATS/BLANK E2E CHECKS PASSED ✅" : `\n${fail} CHECKS FAILED ❌`);
process.exit(fail === 0 ? 0 : 1);
