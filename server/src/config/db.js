import mongoose from "mongoose";

import { env } from "./env.js";

/**
 * Connects to MongoDB. When MONGO_URI is empty (dev without Atlas),
 * the server keeps running in degraded mode — health endpoint reports it.
 */
export async function connectDB() {
  if (!env.MONGO_URI) {
    console.warn("[db] MONGO_URI not set — running without database (degraded mode)");
    return;
  }
  mongoose.connection.on("connected", () => console.log("[db] MongoDB connected"));
  mongoose.connection.on("error", (err) => console.error("[db] MongoDB error:", err.message));
  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
