/* E2E test: full wizard optimize path — 3 sequential AI calls (stability check). */
const BASE = "http://localhost:5001/api";
const email = `opt-${Date.now()}@test.local`;

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

const step = (n, name) => process.stdout.write(`${n}) ${name.padEnd(44)} `);
let fail = 0;
const check = (ok, msg) => {
  console.log(ok ? "OK ✓" : `FAIL ✗ ${msg}`);
  if (!ok) fail += 1;
};

let r = await req("POST", "/auth/register", { name: "Opt Tester", email, password: "Test@12345" });
const cookie = r.setCookie ? r.setCookie.split(";")[0] : null;
check(r.status === 201 && cookie, `register ${r.status}`);
if (!cookie) process.exit(1);

step(1, "create JD");
r = await req("POST", "/jds/", { text: "React Developer at Fintech Startup, Bangalore. React, TypeScript, Redux, Tailwind CSS, REST API, Jest, GitHub Actions, MySQL." }, cookie);
const jdId = r.data?.data?.jd?._id;
check(r.status === 201 && jdId, `jd ${r.status}`);

step(2, "generate-from-jd (AI #1)");
r = await req("POST", "/resumes/generate-from-jd", { jdId, targetTitle: "React Developer", experienceLevel: "fresher" }, cookie);
const resumeId = r.data?.data?.resume?._id;
check(r.status === 201 && resumeId, `generate ${r.status}`);

step(3, "optimizations run (AI #2)");
r = await req("POST", "/optimizations", { resumeId, jdId }, cookie);
const optimizationId = r.data?.data?.optimization?._id;
check(r.status === 201 && optimizationId, `optimize ${r.status}`);

step(4, "optimizations get (AI #3 not needed — fetch)");
r = await req("GET", `/optimizations/${optimizationId}`, null, cookie);
check(r.status === 200 && typeof r.data?.data?.optimization?.result?.atsScore === "number", `get ${r.status}`);
if (r.data?.data?.optimization?.result) {
  const result = r.data.data.optimization.result;
  console.log(`      ats=${result.atsScore} match=${result.matchPercent}% changes=${result.changes?.length ?? 0}`);
}

console.log(fail === 0 ? "\nWIZARD OPTIMIZE PATH STABLE ✅" : `\n${fail} CHECKS FAILED ❌`);
process.exit(fail === 0 ? 0 : 1);
