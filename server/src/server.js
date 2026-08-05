import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`[server] API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

// Best-effort DB connection — never blocks startup
connectDB().catch((err) => {
  console.error("[db] initial connection failed:", err.message);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`[server] ${signal} received — shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Never let a stray async error kill the server mid-request. AI/DB
// hiccups surface as unhandled rejections; without these handlers Node
// crashes the WHOLE process -> node --watch restarts -> every in-flight
// AI request dies with 502/ECONNRESET. Log and keep serving instead.
process.on("unhandledRejection", (reason) => {
  console.error("[server] unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[server] uncaughtException:", err);
});
