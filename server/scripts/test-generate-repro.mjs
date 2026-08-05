/* Reproduce generate crash: register -> JD -> upload -> generate (5001). */
import { writeFileSync, unlinkSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:5001/api";
const email = `gen-${Date.now()}@test.local`;

async function req(method, path, body, cookie) {
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  return { status: res.status, data, setCookie: res.headers.get("set-cookie") };
}

const step = (n, name) => process.stdout.write(`${n}) ${name.padEnd(40)} `);
let fail = 0;
const check = (ok, msg) => { console.log(ok ? "OK ✓" : `FAIL ✗ ${msg}`); if (!ok) fail += 1; };

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

let r = await req("POST", "/auth/register", { name: "Gen Tester", email, password: "Test@12345" });
const cookie = r.setCookie ? r.setCookie.split(";")[0] : null;
check(r.status === 201 && cookie, `register ${r.status}`);
if (!cookie) process.exit(1);

step(1, "create JD");
r = await req("POST", "/jds/", { text: "React Developer at Fintech Startup, Bangalore. React, TypeScript, Redux, Tailwind CSS, REST API, Jest, GitHub Actions, MySQL." }, cookie);
const jdId = r.data?.data?.jd?._id;
check(r.status === 201 && jdId, `jd ${r.status}`);

step(2, "upload resume (PDF)");
{
  const form = new FormData();
  form.append("resume", new Blob([pdf], { type: "application/pdf" }), "gen-resume.pdf");
  const res = await fetch(`${BASE}/resumes`, { method: "POST", headers: { Cookie: cookie }, body: form });
  const data = await res.json();
  r = { status: res.status, data };
}
const resumeId = r.data?.data?.resume?._id;
check(r.status === 201 && resumeId, `upload ${r.status}`);
if (!resumeId) process.exit(1);

step(3, "generate (AI call, ~60-150s)");
const t0 = Date.now();
try {
  r = await req("POST", `/resumes/${resumeId}/generate`, { jdId }, cookie);
  const ms = Date.now() - t0;
  console.log(`-> ${r.status} in ${(ms / 1000).toFixed(1)}s`);
  check(r.status === 201 && r.data?.data?.resume?._id, `generate got ${r.status}: ${JSON.stringify(r.data)?.slice(0, 200)}`);
} catch (err) {
  console.log(`-> FETCH FAILED after ${((Date.now() - t0) / 1000).toFixed(1)}s: ${err.cause?.code ?? err.message}`);
  fail += 1;
}

console.log(fail === 0 ? "\nGENERATE REPRODUCED CLEAN ✅" : `\n${fail} FAILED ❌`);
process.exit(fail === 0 ? 0 : 1);
