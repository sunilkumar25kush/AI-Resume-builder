import mongoose from "mongoose";

import { env } from "./env.js";

let lastDbError = null;

// Disable Mongoose command buffering so queries fail immediately rather than
// hanging for 10 seconds when the database is disconnected.
mongoose.set("bufferCommands", false);

/**
 * Connects to MongoDB. When MONGO_URI is empty (dev without Atlas),
 * the server keeps running in degraded mode — health endpoint reports it.
 */
export async function connectDB() {
  if (!env.MONGO_URI) {
    console.warn("[db] MONGO_URI not set — running without database (degraded mode)");
    return;
  }
  mongoose.connection.on("connected", () => {
    lastDbError = null;
    console.log("[db] MongoDB connected");
  });
  mongoose.connection.on("error", (err) => {
    lastDbError = err.message;
    console.error("[db] MongoDB error:", err.message);
  });
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    lastDbError = null;
  } catch (err) {
    lastDbError = err.message;
    throw err;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export function getDbError() {
  return lastDbError;
}
