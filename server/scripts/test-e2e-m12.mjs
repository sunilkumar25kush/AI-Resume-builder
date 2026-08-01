// M12 browser-path E2E via the Vite dev proxy — AI assist flow.
const BASE = "http://localhost:5173/api";

const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M12 Proxy", email: `m12p-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status);

const assist = await fetch(`${BASE}/ai/assist`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({
    section: "summary",
    action: "professional",
    content: "I do frontend work and make things look good.",
  }),
});
const json = await assist.json();
console.log("assist via proxy:", assist.status, "| result:", json.data?.result?.slice(0, 70));

const entry = await fetch(`${BASE}/ai/assist`, {
  method: "POST",
  headers: { cookie, "content-type": "application/json" },
  body: JSON.stringify({
    section: "experience",
    action: "improve",
    content: { title: "Dev", company: "Acme", startDate: "2021", endDate: "2023", description: "did stuff" },
  }),
});
const entryJson = await entry.json();
console.log("entry assist via proxy:", entry.status, "| company:", entryJson.data?.result?.company, "| desc:", entryJson.data?.result?.description?.slice(0, 50));

const pages = await fetch("http://localhost:5173/resumes", { redirect: "manual" });
console.log("client /resumes:", pages.status);
