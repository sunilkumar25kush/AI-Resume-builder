/* E2E test: wizard generate-from-jd flow + resume rename (500 fix verification). */
const BASE = "http://localhost:5001/api";
const email = `e2e-${Date.now()}@test.local`;

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
  // 1) Register a throwaway user (token is set as an httpOnly cookie)
  const reg = await req("POST", "/auth/register", { name: "E2E Tester", email, password: "test1234!" });
  if (reg.status !== 201) throw new Error(`register failed ${reg.status}: ${reg.text}`);
  const cookie = reg.cookie.split(";")[0];
  if (!cookie) throw new Error("no auth cookie returned");
  console.log("1) register            -> 201 ✓");

  // 2) Create a JD from text
  const jd = await req("POST", "/jds/", {
    text: "Java Trainer at Coding Institute, Delhi. Teach Core Java, Spring Boot, Hibernate, MySQL, HTML/CSS/JavaScript. Build training material, mentor students, assess assignments. 2+ years teaching preferred.",
  }, cookie);
  if (jd.status !== 201) throw new Error(`jd create failed ${jd.status}: ${jd.text}`);
  const jdId = jd.json.data.jd._id;
  console.log("2) create JD           -> 201 ✓ (jdId:", jdId, ")");

  // 3) generate-from-jd (THE 500 path from the wizard)
  const gen = await req("POST", "/resumes/generate-from-jd", {
    jdId,
    targetTitle: "Java Trainer",
    experienceLevel: "fresher",
  }, cookie);
  if (gen.status !== 201) {
    console.error("3) generate-from-jd   ->", gen.status, gen.text);
    process.exit(1);
  }
  const resume = gen.json.data.resume;
  const keys = Object.keys(resume.parsedData || {});
  console.log("3) generate-from-jd    -> 201 ✓ resume:", resume._id, "| parsedData keys:", keys.join(","));
  console.log("   fileName:", resume.fileName, "| skills:", (resume.parsedData.skills || []).length, "| projects:", (resume.parsedData.projects || []).length);

  // 3b) aiChanges must be present (green-highlight feature) with real values
  const changes = resume.aiChanges || [];
  if (!Array.isArray(changes) || changes.length === 0) {
    console.error("3b) aiChanges           -> MISSING on generated resume:", JSON.stringify(resume).slice(0, 300));
    process.exit(1);
  }
  const bad = changes.filter((c) => !c.value || !c.section);
  if (bad.length > 0) {
    console.error("3b) aiChanges           -> malformed entries:", JSON.stringify(bad));
    process.exit(1);
  }
  console.log("3b) aiChanges           ->", changes.length, "entries ✓ (e.g.", changes[0].value, ")");

  // 3c) project technologies (JD-only prompt now fills them)
  const projects = resume.parsedData.projects || [];
  const withTech = projects.filter((p) => p.technologies && p.technologies.trim());
  console.log("3c) project technologies ->", withTech.length, "/", projects.length, "projects have technologies");

  // 4) Rename the resume (new feature)
  const newName = "Sunil Kumar Java Trainer.pdf";
  const ren = await req("PATCH", `/resumes/${resume._id}`, { fileName: newName }, cookie);
  if (ren.status !== 200 || ren.json.data.resume.fileName !== newName) {
    console.error("4) rename resume       ->", ren.status, ren.text);
    process.exit(1);
  }
  console.log("4) rename resume       -> 200 ✓ fileName =", ren.json.data.resume.fileName);

  // 5) Rename the JD title (new feature)
  const jdRen = await req("PATCH", `/jds/${jdId}`, { title: "Java Trainer — NavGurukul" }, cookie);
  if (jdRen.status !== 200 || jdRen.json.data.jd.title !== "Java Trainer — NavGurukul") {
    console.error("5) rename JD           ->", jdRen.status, jdRen.text);
    process.exit(1);
  }
  console.log("5) rename JD           -> 200 ✓ title =", jdRen.json.data.jd.title);

  console.log("\nALL E2E CHECKS PASSED ✅");
}

main().catch((err) => { console.error("E2E FAILED:", err.message); process.exit(1); });
