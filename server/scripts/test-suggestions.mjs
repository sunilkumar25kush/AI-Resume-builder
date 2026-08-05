/* E2E test: editor AI suggestions endpoint (Module B). */
const BASE = "http://localhost:5001/api";
const email = `sug-${Date.now()}@test.local`;

async function req(method, path, body, cookie) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* non-JSON */ }
  return { status: res.status, json, text: text.slice(0, 300), cookie: res.headers.get("set-cookie") ?? "" };
}

async function main() {
  const reg = await req("POST", "/auth/register", { name: "Sug Tester", email, password: "test1234!" });
  if (reg.status !== 201) throw new Error(`register failed ${reg.status}: ${reg.text}`);
  const cookie = reg.cookie.split(";")[0];
  console.log("1) register             -> 201 ✓");

  const jd = await req("POST", "/jds/", {
    text: "React Developer at Fintech Startup, Bangalore. React, TypeScript, Redux, Tailwind CSS, REST API, Jest, GitHub Actions, MySQL.",
  }, cookie);
  if (jd.status !== 201) throw new Error(`jd create failed ${jd.status}: ${jd.text}`);
  const jdId = jd.json.data.jd._id;
  console.log("2) create JD            -> 201 ✓");

  const gen = await req("POST", "/resumes/generate-from-jd", {
    jdId,
    targetTitle: "React Developer",
    experienceLevel: "fresher",
  }, cookie);
  if (gen.status !== 201) throw new Error(`generate-from-jd failed ${gen.status}: ${gen.text}`);
  const resumeId = gen.json.data.resume._id;
  console.log("3) generate-from-jd     -> 201 ✓ resume:", resumeId);

  // 4) The new endpoint: JD-aware suggestions
  const sug = await req("POST", "/ai/suggestions", { resumeId, jdId }, cookie);
  if (sug.status !== 200) {
    console.error("4) suggestions           ->", sug.status, sug.text);
    process.exit(1);
  }
  const list = sug.json.data.suggestions;
  if (!Array.isArray(list) || list.length === 0) {
    console.error("4) suggestions           -> EMPTY:", JSON.stringify(sug.json).slice(0, 300));
    process.exit(1);
  }
  const bad = list.filter((s) => !s.value || !s.type);
  if (bad.length > 0) {
    console.error("4) suggestions           -> malformed:", JSON.stringify(bad));
    process.exit(1);
  }
  console.log(`4) suggestions           -> 200 ✓ ${list.length} entries`);
  for (const s of list.slice(0, 5)) {
    console.log(`   - [${s.type}] ${s.value} (${s.reason})`);
  }

  // 5) Validation: jdText mode without jdId
  const sug2 = await req("POST", "/ai/suggestions", {
    resumeId,
    jdText: "Node.js backend developer. Express, MongoDB, Redis, Docker, AWS deployment.",
  }, cookie);
  if (sug2.status !== 200) throw new Error(`jdText mode failed ${sug2.status}: ${sug2.text}`);
  console.log(`5) suggestions (paste)   -> 200 ✓ ${sug2.json.data.suggestions.length} entries`);

  // 6) Validation: neither jdId nor jdText -> 400
  const badReq = await req("POST", "/ai/suggestions", { resumeId }, cookie);
  if (badReq.status !== 400) throw new Error(`expected 400, got ${badReq.status}`);
  console.log("6) validation (no JD)    -> 400 ✓");

  console.log("\nALL SUGGESTION E2E CHECKS PASSED ✅");
}

main().catch((err) => { console.error("E2E FAILED:", err.message); process.exit(1); });
