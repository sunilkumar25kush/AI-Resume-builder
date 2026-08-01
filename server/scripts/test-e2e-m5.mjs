// M5 browser-path E2E via the Vite dev proxy (5173) — same origin the browser uses.
const BASE = "http://localhost:5173/api";
let cookie = "";

const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M5 Proxy", email: `m5p-${Date.now()}@test.com`, password: "password123" }),
});
cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status, cookie.startsWith("token=") ? "cookie ✓" : "cookie ✗");

// Paste-text JD through the proxy
const sample = `Senior React Developer at TechNova

Responsibilities
- Lead the frontend team
- Build reusable components

Qualifications
- 5+ years of experience with React
- Strong knowledge of TypeScript

Skills
React, TypeScript, Node.js`;
const paste = await fetch(`${BASE}/jds`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ text: sample }),
});
const pasteJson = await paste.json();
const id = pasteJson.data?.jd?._id;
console.log("paste via proxy:", paste.status, "| title:", pasteJson.data?.jd?.title, "| company:", pasteJson.data?.jd?.company);

const list = await fetch(`${BASE}/jds`, { headers: { cookie } });
const listJson = await list.json();
console.log("list via proxy:", list.status, "| count:", listJson.data?.jds?.length);

const patch = await fetch(`${BASE}/jds/${id}`, {
  method: "PATCH",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({ title: "Senior React Engineer", skills: ["React", "TypeScript", "Next.js"] }),
});
const patchJson = await patch.json();
console.log("patch via proxy:", patch.status, "| title:", patchJson.data?.jd?.title, "| skills:", patchJson.data?.jd?.skills?.length);

const del = await fetch(`${BASE}/jds/${id}`, { method: "DELETE", headers: { cookie } });
console.log("delete via proxy:", del.status);

for (const p of ["/jds", "/jds/someid", "/jds/someid/edit"]) {
  const r = await fetch(`http://localhost:5173${p}`, { redirect: "manual" });
  console.log(`client ${p}:`, r.status);
}
