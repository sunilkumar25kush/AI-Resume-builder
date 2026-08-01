// M12 tests — per-section AI assist: prompt unit, live assist calls
// (summary, shorten, entry facts, skills no-invention), validation.
import { buildAssistPrompt } from "../src/services/ai/prompts.js";

const BASE = "http://localhost:5001/api";
let passed = 0;
let failed = 0;
function check(label, ok, extra = "") {
  console.log(`${ok ? "  \u2713" : "  \u2717"} ${label}${extra ? ` — ${extra}` : ""}`);
  if (ok) passed += 1;
  else failed += 1;
}

// --- Unit: prompt builder ---
const p = buildAssistPrompt({ section: "summary", action: "shorten", content: "Long summary text here" });
check("assist prompt has action", p.includes("Shorten it"));
check("assist prompt has content", p.includes("Long summary text here"));
const pe = buildAssistPrompt({ section: "experience", action: "improve", content: { title: "Dev", company: "X", description: "did stuff" } });
check("entry prompt has verbatim rule", pe.includes("VERBATIM"));
check("entry prompt has json", pe.includes('"company"'));

const reg = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "M12 Tester", email: `m12-${Date.now()}@test.com`, password: "password123" }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
console.log("register:", reg.status);

const assistCall = (body) =>
  fetch(`${BASE}/ai/assist`, { method: "POST", headers: { cookie, "content-type": "application/json" }, body: JSON.stringify(body) });

// Summary improve
let res = await assistCall({ section: "summary", action: "improve", content: "I am a developer who works on web apps and likes to build things." });
let json = await res.json();
const improved = json.data?.result;
check("summary improve 200", res.status === 200, String(res.status));
check("summary improved", typeof improved === "string" && improved.length > 0, improved?.slice(0, 50));
check("summary changed", improved !== "I am a developer who works on web apps and likes to build things.");

// Shorten — result must be strictly shorter than the input
const longSummary = "I am a developer who works on web apps and likes to build things. I also enjoy learning new technologies and contributing to open source projects in my free time.";
res = await assistCall({ section: "summary", action: "shorten", content: longSummary });
json = await res.json();
const short = json.data?.result;
check("shorten 200", res.status === 200);
check("shorten shorter", typeof short === "string" && short.length > 0 && short.length < longSummary.length, `in ${longSummary.length} → out ${short?.length}`);

// Experience entry — facts verbatim, description rewritten
const entry = { title: "Senior Developer", company: "TechNova Pvt Ltd", location: "Bangalore", startDate: "2022-03", endDate: "2024-01", description: "worked on the dashboard and did some stuff" };
res = await assistCall({ section: "experience", action: "improve", content: entry });
json = await res.json();
const out = json.data?.result;
check("entry improve 200", res.status === 200);
check("entry facts verbatim", out?.company === "TechNova Pvt Ltd" && out?.title === "Senior Developer" && out?.startDate === "2022-03" && out?.endDate === "2024-01", JSON.stringify([out?.company, out?.startDate]));
check("entry description improved", typeof out?.description === "string" && out.description.length > 0 && out.description !== entry.description, out?.description?.slice(0, 60));

// Skills — no invention (subset of input)
const skillsIn = ["React", "Node.js", "MongoDB"];
res = await assistCall({ section: "skills", action: "improve", content: skillsIn });
json = await res.json();
const skills = json.data?.result;
check("skills 200", res.status === 200);
check("skills array", Array.isArray(skills) && skills.length > 0);
const known = new Set(skillsIn.map((s) => s.toLowerCase()));
check("skills never invented", skills.every((s) => known.has(s.toLowerCase())), JSON.stringify(skills));

// Validation + auth
res = await assistCall({ section: "summary", action: "bogus", content: "x" });
check("invalid action 400", res.status === 400);
res = await assistCall({ section: "bogus", action: "improve", content: "x" });
check("invalid section 400", res.status === 400);
res = await assistCall({ section: "summary", action: "improve" });
check("missing content 400", res.status === 400);
const noAuth = await fetch(`${BASE}/ai/assist`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ section: "summary", action: "improve", content: "x" }) });
check("no auth 401", noAuth.status === 401);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
