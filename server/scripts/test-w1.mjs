// W1 tests — Workflow 1 (JD-only): TXT upload + generate-from-jd fresher resume.
const BASE = "http://localhost:5001/api";
let passed = 0;
let failed = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "  \u2713" : "  \u2717"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (ok) passed += 1;
  else failed += 1;
}

const ping = await fetch(`${BASE}/ai/ping`).catch(() => null);
const aiUp = ping?.status === 200;
console.log("ai/ping:", ping?.status ?? "down");
if (!aiUp) {
  console.log("SKIP AI-dependent tests (Gemini down) — running non-AI checks only");
}

const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "W1 Tester", email: `w1-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status);

// --- TXT JD upload ---
const jdText = `Software Engineer (React)
TechNova Solutions

We are looking for a Software Engineer with 2-4 years of experience.

Responsibilities:
- Build responsive web applications with React and TypeScript
- Design REST APIs with Node.js and Express
- Write unit tests with Jest and Playwright

Required Skills:
- React, TypeScript, JavaScript, HTML, CSS
- Node.js, Express, MongoDB, Git
- Jest, Playwright, CI/CD

Preferred Skills:
- GraphQL, Docker, Kubernetes, AWS

Qualifications:
- Bachelor's degree in Computer Science or related field
- Strong problem-solving and communication skills

Nice to have:
- Experience with Next.js
- Familiarity with Redux`;

const form = new FormData();
form.append("jd", new Blob([jdText], { type: "text/plain" }), "job.txt");
const jdUpload = await fetch(`${BASE}/jds`, { method: "POST", headers: { cookie }, body: form });
const jdJson = await jdUpload.json();
const jd = jdJson.data?.jd;
check("TXT jd upload 201", jdUpload.status === 201, String(jdUpload.status));
check("jd parsed title", typeof jd?.title === "string" && jd.title.length > 0, jd?.title);
check("jd skills extracted", Array.isArray(jd?.skills) && jd.skills.length >= 3, String(jd?.skills?.length));
check("jd responsibilities extracted", Array.isArray(jd?.responsibilities) && jd.responsibilities.length >= 1, String(jd?.responsibilities?.length));
check("jd experienceRequired parsed", typeof jd?.experienceRequired === "string" && jd.experienceRequired.length > 0, String(jd?.experienceRequired));

// --- validation ---
const bad = await fetch(`${BASE}/resumes/generate-from-jd`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({}),
});
check("missing jdId → 400", bad.status === 400, String(bad.status));

if (aiUp) {
  // --- JD-only generation ---
  const gen = await fetch(`${BASE}/resumes/generate-from-jd`, {
    method: "POST",
    headers: { cookie, "content-type": "application/json" },
    body: JSON.stringify({ jdId: jd._id, targetTitle: "React Developer", experienceLevel: "fresher" }),
  });
  const genJson = await gen.json();
  const resume = genJson.data?.resume;
  console.log("generate-from-jd:", gen.status, genJson.message ?? "");
  check("generate 201", gen.status === 201, String(gen.status));
  check("resume saved", Boolean(resume?._id));
  check("template classic", resume?.template === "classic");
  check("fileName slug", typeof resume?.fileName === "string" && resume.fileName.includes("react-developer"), String(resume?.fileName));
  const d = resume?.parsedData ?? {};
  check("name empty (no fabrication)", d.name === "", JSON.stringify(d.name));
  check("summary non-empty", typeof d.summary === "string" && d.summary.length > 30, `${(d.summary ?? "").length} chars`);
  check("skills from JD", Array.isArray(d.skills) && d.skills.length >= 5, String(d.skills?.length));
  check("skill originates in JD", d.skills?.some((s) => jdText.toLowerCase().includes(s.toLowerCase())), String(d.skills?.[0]));
  check("experience EMPTY (never invented)", Array.isArray(d.experience) && d.experience.length === 0, String(d.experience?.length));
  check("education EMPTY", Array.isArray(d.education) && d.education.length === 0, String(d.education?.length));
  check("certifications EMPTY", Array.isArray(d.certifications) && d.certifications.length === 0, String(d.certifications?.length));
  check("languages EMPTY", Array.isArray(d.languages) && d.languages.length === 0, String(d.languages?.length));
  check("awards EMPTY", Array.isArray(d.awards) && d.awards.length === 0, String(d.awards?.length));
  check("contact EMPTY", d.contact?.email === "" && d.contact?.phone === "", JSON.stringify(d.contact));
  check("projects non-empty (portfolio ideas)", Array.isArray(d.projects) && d.projects.length >= 1, String(d.projects?.length));
  check("project has no fake link", d.projects?.every((p) => p.link === ""), String(d.projects?.[0]?.link));

  // ownership isolation
  const reg2 = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Other", email: `w1b-${Date.now()}@test.com`, password: "password123" }),
  });
  const cookie2 = (reg2.headers.get("set-cookie") ?? "").split(";")[0];
  const cross = await fetch(`${BASE}/resumes/generate-from-jd`, {
    method: "POST",
    headers: { cookie: cookie2, "content-type": "application/json" },
    body: JSON.stringify({ jdId: jd._id }),
  });
  check("cross-user jd → 404", cross.status === 404, String(cross.status));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
