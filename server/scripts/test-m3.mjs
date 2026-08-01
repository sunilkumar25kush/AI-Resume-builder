// M3 backend smoke test — notifications + profile + avatar (Node fetch, no curl quirks)
const BASE = "http://localhost:5001/api";
let pass = 0;
let fail = 0;

const results = [];
function check(name, ok, detail = "") {
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  ok ? pass++ : fail++;
}

// --- tiny cookie jar ---
let cookie = "";
function readCookie(setCookie) {
  const c = (Array.isArray(setCookie) ? setCookie : [setCookie]).find((v) => v && v.startsWith("token="));
  if (c) cookie = c.split(";")[0];
}
async function api(method, path, { body, form, raw } = {}) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (body) headers["content-type"] = "application/json";
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : form ? form : raw ? raw : undefined,
    redirect: "manual",
  });
  readCookie(res.headers.get("set-cookie"));
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }
  return { status: res.status, json, headers: res.headers };
}

// 1x1 PNG bytes
const PNG = Buffer.from(
  "89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000c49444154789c63f8cfc0000000030001000000000000",
  "hex",
);

const email = `m3-${Date.now()}@test.com`;

const main = async () => {
  // REGISTER + welcome notification
  const reg = await api("POST", "/auth/register", {
    body: { name: "M3 Tester", email, password: "password123" },
  });
  check("register -> 201", reg.status === 201, `status=${reg.status}`);
  check("register sets cookie", cookie.startsWith("token="), "cookie present");

  // NOTIFICATIONS
  const notif = await api("GET", "/notifications");
  check("notifications list -> 200", notif.status === 200, `status=${notif.status}`);
  const items = notif.json?.data?.items ?? [];
  check("welcome notification exists", items.length >= 1 && /Welcome/i.test(items[0]?.title ?? ""), `count=${items.length}`);
  const nid = items[0]?._id ?? "";
  check("notification unread", items[0]?.read === false, "read=false");

  const read = await api("PATCH", `/notifications/${nid}/read`);
  check("mark read -> 200", read.status === 200, `status=${read.status}`);

  const afterRead = await api("GET", "/notifications?page=1");
  check("notification now read", afterRead.json?.data?.items?.[0]?.read === true);

  const readAll = await api("PATCH", "/notifications/read-all");
  check("mark all read -> 200", readAll.status === 200, `status=${readAll.status}`);

  // PROFILE
  const prof = await api("PATCH", "/users/me", { body: { name: "M3 Tester Updated" } });
  check("update name -> 200", prof.status === 200 && prof.json?.data?.user?.name === "M3 Tester Updated", `status=${prof.status}`);

  const bad = await api("PATCH", "/users/me", { body: { name: "a" } });
  check("short name -> 400", bad.status === 400, `status=${bad.status}`);

  const noAuth = await fetch(`${BASE}/users/me`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "No Auth" }),
  });
  check("no auth -> 401", noAuth.status === 401, `status=${noAuth.status}`);

  // AVATAR
  const fd = new FormData();
  fd.append("avatar", new Blob([PNG], { type: "image/png" }), "pixel.png");
  const av = await fetch(`${BASE}/users/me/avatar`, { method: "PATCH", headers: { cookie }, body: fd });
  const avJson = await av.json();
  const avPath = avJson?.data?.user?.avatar ?? "";
  check("avatar upload -> 200", av.status === 200, `status=${av.status} path=${avPath}`);
  const avGet = await fetch(`http://localhost:5001${avPath}`);
  check("avatar serves -> 200", avGet.status === 200, `status=${avGet.status}`);

  // BAD FILE (wrong mime type should be rejected by multer's fileFilter)
  const badFd = new FormData();
  badFd.append("avatar", new Blob(["not an image"], { type: "text/plain" }), "fake.txt");
  const badAv = await fetch(`${BASE}/users/me/avatar`, { method: "PATCH", headers: { cookie }, body: badFd });
  check("text as avatar -> 400", badAv.status === 400, `status=${badAv.status}`);

  // BAD FILE size (multer limit)
  const bigFd = new FormData();
  bigFd.append("avatar", new Blob([Buffer.alloc(3 * 1024 * 1024)], { type: "image/png" }), "big.png");
  const bigAv = await fetch(`${BASE}/users/me/avatar`, { method: "PATCH", headers: { cookie }, body: bigFd });
  check("oversized avatar -> 413", bigAv.status === 413, `status=${bigAv.status}`);

  // clean up test user (leave no junk in DB)
  await fetch(`${BASE}/auth/logout`, { method: "POST", headers: { cookie } });

  console.log(results.join("\n"));
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
};

main().catch((err) => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
