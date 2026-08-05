// W2 E2E — wizard API chain through the Vite proxy (localhost:5173):
// paste JD -> generate-from-jd -> design PATCH -> editor GET.
const BASE = "http://localhost:5173/api";
let passed = 0;
let failed = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "  \u2713" : "  \u2717"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (ok) passed += 1;
  else failed += 1;
}

const ping = await fetch(`${BASE}/ai/ping`).catch(() => null);
if (ping?.status !== 200) {
  console.log("SKIP — AI/Gemini down or proxy not ready");
  process.exit(0);
}

const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "W2 E2E", email: `w2e2e-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
check("register via proxy", reg.status === 201, String(reg.status));

// Step 3: paste JD
const jdText = `Frontend Developer
Responsibilities:
- Build UI with React and TypeScript
- Write tests with Jest

Required Skills:
- React, TypeScript, Tailwind CSS, Git
Preferred Skills:
- Next.js, GraphQL`;
const jdRes = await fetch(`${BASE}/jds`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ text: jdText }),
});
const jd = (await jdRes.json()).data?.jd;
check("step3 paste JD → 201", jdRes.status === 201, String(jdRes.status));
check("jd skills parsed", jd?.skills?.length >= 4, String(jd?.skills?.length));

// Step 5: generate from JD (fresher)
const genRes = await fetch(`${BASE}/resumes/generate-from-jd`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ jdId: jd._id, targetTitle: "Frontend Developer", experienceLevel: "fresher" }),
});
const resume = (await genRes.json()).data?.resume;
check("step5 generate-from-jd → 201", genRes.status === 201, String(genRes.status));
check("summary written", typeof resume?.parsedData?.summary === "string" && resume.parsedData.summary.length > 30, `${(resume?.parsedData?.summary ?? "").length} chars`);
check("no fake experience", resume?.parsedData?.experience?.length === 0, String(resume?.parsedData?.experience?.length));

// Step 6: design choice — pick a template
const designRes = await fetch(`${BASE}/resumes/${resume._id}`, {
  method: "PATCH",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ template: "modern" }),
});
const designed = (await designRes.json()).data?.resume;
check("step6 template PATCH → 200", designRes.status === 200, String(designRes.status));
check("template applied", designed?.template === "modern", String(designed?.template));

// Step 7: editor loads the generated resume
const getRes = await fetch(`${BASE}/resumes/${resume._id}`, { headers: { cookie } });
const fetched = (await getRes.json()).data?.resume;
check("step7 editor GET → 200", getRes.status === 200, String(getRes.status));
check("editable sections intact", Array.isArray(fetched?.parsedData?.skills) && Array.isArray(fetched?.parsedData?.projects), `skills=${fetched?.parsedData?.skills?.length} projects=${fetched?.parsedData?.projects?.length}`);

// Edit persists (step 7 action)
const editRes = await fetch(`${BASE}/resumes/${resume._id}`, {
  method: "PATCH",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ parsedData: { name: "Priyanshi Sharma", contact: { email: "priyanshi@test.com", phone: "+919999999999", location: "", linkedin: "", github: "" } } }),
});
const edited = (await editRes.json()).data?.resume;
check("edit name persists", edited?.parsedData?.name === "Priyanshi Sharma", String(edited?.parsedData?.name));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
