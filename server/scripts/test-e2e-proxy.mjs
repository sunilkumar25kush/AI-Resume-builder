// Browser-path E2E via the Vite dev proxy (5173) — same origin the browser uses.
const BASE = "http://localhost:5173/api";
let cookie = "";

const res = await fetch(`${BASE}/auth/register`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "Proxy Tester", email: `proxy-${Date.now()}@test.com`, password: "password123" }),
  redirect: "manual",
});
const setCookie = res.headers.get("set-cookie") ?? "";
cookie = setCookie.split(";")[0];
console.log("register via proxy:", res.status, "| cookie:", cookie.startsWith("token=") ? "SET ✓" : "MISSING ✗");

const me = await fetch(`${BASE}/auth/me`, { headers: { cookie } });
console.log("me via proxy:", me.status, "| user:", (await me.json()).data.user.name);

const notif = await fetch(`${BASE}/notifications`, { headers: { cookie } });
const data = await notif.json();
console.log("notifications via proxy:", notif.status, "| count:", data.data.items.length, "| first:", data.data.items[0]?.title);

const prof = await fetch(`${BASE}/profile-page-check`, { redirect: "manual" });
console.log("client /profile page:", await fetch("http://localhost:5173/profile", { redirect: "manual" }).then((r) => r.status));
console.log("client /settings page:", await fetch("http://localhost:5173/settings", { redirect: "manual" }).then((r) => r.status));
console.log("client /notifications page:", await fetch("http://localhost:5173/notifications", { redirect: "manual" }).then((r) => r.status));
