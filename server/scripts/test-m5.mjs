// M5 smoke tests — JD parse + CRUD via the real API (localhost:5001).
const BASE = "http://localhost:5001/api";
let cookie = "";
let passed = 0;
let failed = 0;

function check(label, ok, extra = "") {
  if (ok) {
    passed += 1;
    console.log(`  ✓ ${label}${extra ? ` — ${extra}` : ""}`);
  } else {
    failed += 1;
    console.log(`  ✗ ${label}${extra ? ` — ${extra}` : ""}`);
  }
}

async function api(path, { method = "GET", body, form, headers = {} } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { ...(form ? {} : body ? { "content-type": "application/json" } : {}), cookie, ...headers },
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  return { status: res.status, json };
}

function buildPdf(lines) {
  const objects = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>";
  const stream = lines.map((line, i) => `BT /F1 10 Tf 72 ${760 - i * 14} Td (${line}) Tj ET`).join("\n");
  objects[4] = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`;
  objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 1; i <= 5; i++) {
    offsets[i] = Buffer.byteLength(pdf);
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

const SAMPLE_JD = `Senior React Developer at TechNova

About the role
You will build modern web applications for our clients.

Responsibilities
- Lead the frontend team
- Build reusable components
- Optimize performance

Qualifications
- 5+ years of experience with React
- Strong knowledge of TypeScript
- Bachelor's degree in Computer Science

Skills
React, TypeScript, Node.js, GraphQL`;

// 1. Register
const regRes = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M5 Tester", email: `m5-${Date.now()}@test.com`, password: "password123" }),
});
cookie = (regRes.headers.get("set-cookie") ?? "").split(";")[0];
check("register", regRes.status === 201, `status ${regRes.status}`);

// 2. Paste-text JD parse
const paste = await api("/jds", { method: "POST", body: { text: SAMPLE_JD } });
const jd = paste.json?.data?.jd;
check("paste JD 201", paste.status === 201, `status ${paste.status}`);
check("title parsed", jd?.title === "Senior React Developer", JSON.stringify(jd?.title ?? ""));
check("company parsed", jd?.company === "TechNova", JSON.stringify(jd?.company ?? ""));
check("skills parsed", Array.isArray(jd?.skills) && jd.skills.includes("React") && jd.skills.includes("TypeScript"), JSON.stringify(jd?.skills ?? []));
check("qualifications parsed", Array.isArray(jd?.qualifications) && jd.qualifications.length >= 3, `count ${jd?.qualifications?.length}`);
check("responsibilities parsed", Array.isArray(jd?.responsibilities) && jd.responsibilities.length >= 3, `count ${jd?.responsibilities?.length}`);
check("source=paste", jd?.source === "paste", jd?.source);

// 3. Edge cases
const empty = await api("/jds", { method: "POST", body: { text: "   " } });
check("empty text 400", empty.status === 400, `status ${empty.status}`);
const garbage = await api("/jds", { method: "POST", body: { text: "xyz123" } });
check("garbage text 400", garbage.status === 400, `status ${garbage.status}`);
const tooLong = await api("/jds", { method: "POST", body: { text: "x".repeat(50001) } });
check("oversized text 413", tooLong.status === 413, `status ${tooLong.status}`);

// 4. Unstructured JD (no headers) — heuristic classification
const plain = await api("/jds", {
  method: "POST",
  body: {
    text: `Frontend Engineer at WebWorks\n\nBuild and maintain the company dashboard.\nOptimize page load times.\n3+ years of experience with React.\nStrong knowledge of CSS.`,
  },
});
const plainJd = plain.json?.data?.jd;
check("plain JD 201", plain.status === 201, `status ${plain.status}`);
check("plain title", plainJd?.title === "Frontend Engineer", JSON.stringify(plainJd?.title ?? ""));
check("plain company", plainJd?.company === "WebWorks", JSON.stringify(plainJd?.company ?? ""));
check("plain quals via heuristic", plainJd?.qualifications?.length >= 2, `count ${plainJd?.qualifications?.length}`);
check("plain duties via heuristic", plainJd?.responsibilities?.length >= 1, `count ${plainJd?.responsibilities?.length}`);

// 5. File upload (PDF) JD
const form = new FormData();
form.append("jd", new Blob([buildPdf(["Senior Backend Engineer at DataWorks", "Requirements", "5+ years of experience with Node.js", "Skills", "Node.js, PostgreSQL, Docker"])], { type: "application/pdf" }), "jd.pdf");
const fileUp = await fetch(`${BASE}/jds`, { method: "POST", body: form, headers: { cookie } });
const fileJd = (await fileUp.json()).data?.jd;
check("file JD 201", fileUp.status === 201, `status ${fileUp.status}`);
check("file parsed title", fileJd?.title === "Senior Backend Engineer", JSON.stringify(fileJd?.title ?? ""));
check("file parsed skills", Array.isArray(fileJd?.skills) && fileJd.skills.includes("Node.js"), JSON.stringify(fileJd?.skills ?? []));
check("file source", fileJd?.source === "file" && fileJd?.fileName === "jd.pdf", `${fileJd?.source}/${fileJd?.fileName}`);

// 6. List / get
const list = await api("/jds");
const jds = list.json?.data?.jds ?? [];
check("list 200", list.status === 200 && jds.length >= 3, `count ${jds.length}`);
const get = await api(`/jds/${jd._id}`);
check("get 200", get.status === 200 && get.json?.data?.jd?._id === jd._id, `status ${get.status}`);

// 7. Patch
const patch = await api(`/jds/${jd._id}`, {
  method: "PATCH",
  body: { title: "Senior React Engineer", company: "TechNova Labs", skills: ["React", "TypeScript", "Next.js"] },
});
check("patch 200", patch.status === 200, `status ${patch.status}`);
check("patch applied", patch.json?.data?.jd?.title === "Senior React Engineer" && patch.json?.data?.jd?.skills?.includes("Next.js"), JSON.stringify(patch.json?.data?.jd?.title));

// 8. Ownership isolation — second user must NOT see first user's JDs
const otherReg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "Other", email: `m5b-${Date.now()}@test.com`, password: "password123" }),
});
const otherCookie = (otherReg.headers.get("set-cookie") ?? "").split(";")[0];
const otherList = await fetch(`${BASE}/jds`, { headers: { cookie: otherCookie } });
const otherJds = (await otherList.json()).data?.jds ?? [];
check("ownership isolation", otherList.status === 200 && otherJds.length === 0, `other sees ${otherJds.length}`);
const crossGet = await fetch(`${BASE}/jds/${jd._id}`, { headers: { cookie: otherCookie } });
check("cross-user get 404", crossGet.status === 404, `status ${crossGet.status}`);

// 9. Delete
const del = await api(`/jds/${jd._id}`, { method: "DELETE" });
check("delete 200", del.status === 200, `status ${del.status}`);
const afterDel = await api(`/jds/${jd._id}`);
check("get after delete 404", afterDel.status === 404, `status ${afterDel.status}`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
