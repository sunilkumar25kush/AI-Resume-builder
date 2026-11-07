import dns from "node:dns";
import mongoose from "mongoose";

import { env } from "./env.js";

let lastDbError = null;
let listenersAttached = false;
let retryTimeout = null;
let intentionalDisconnect = false;

// Prefer IPv4 resolution order
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

// Disable Mongoose command buffering so queries fail immediately rather than
// hanging for 10 seconds when the database is disconnected.
mongoose.set("bufferCommands", false);

function attachListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("connected", () => {
    lastDbError = null;
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
    console.log("[db] MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    lastDbError = err.message;
    console.error("[db] MongoDB error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    if (intentionalDisconnect) {
      console.log("[db] MongoDB disconnected intentionally");
      return;
    }
    console.warn("[db] MongoDB disconnected — attempting to reconnect in 5s...");
    scheduleRetry();
  });
}

function scheduleRetry() {
  if (
    intentionalDisconnect ||
    retryTimeout ||
    mongoose.connection.readyState === 1 ||
    mongoose.connection.readyState === 2
  ) {
    return;
  }
  retryTimeout = setTimeout(() => {
    retryTimeout = null;
    connectDB().catch(() => {});
  }, 5000);
}

/**
 * Connects to MongoDB. When MONGO_URI is empty (dev without Atlas),
 * the server keeps running in degraded mode — health endpoint reports it.
 */
export async function connectDB() {
  if (!env.MONGO_URI) {
    console.warn("[db] MONGO_URI not set — running without database (degraded mode)");
    return;
  }

  intentionalDisconnect = false;
  attachListeners();

  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    lastDbError = null;
  } catch (err) {
    lastDbError = err.message;

    // Many local networks/ISPs/routers refuse SRV queries (querySrv ECONNREFUSED / ETIMEOUT).
    // Restrict DNS fallback strictly to SRV lookup failures on mongodb+srv:// URIs,
    // and restore the previous DNS servers if the retry still fails.
    const isSrvUri = env.MONGO_URI.startsWith("mongodb+srv://");
    const isSrvLookupFailure =
      isSrvUri &&
      (err.syscall === "querySrv" || Boolean(err.message && err.message.includes("querySrv")));

    if (isSrvLookupFailure) {
      const previousServers = dns.getServers();
      try {
        console.warn("[db] DNS SRV query failed with local resolver. Switching to public DNS (8.8.8.8, 1.1.1.1) and retrying...");
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        await mongoose.connect(env.MONGO_URI, {
          serverSelectionTimeoutMS: 5000,
        });
        lastDbError = null;
        return;
      } catch (retryErr) {
        try {
          dns.setServers(previousServers);
        } catch {}
        lastDbError = retryErr.message;
        scheduleRetry();
        throw retryErr;
      }
    }

    scheduleRetry();
    throw err;
  }
}

export async function disconnectDB() {
  intentionalDisconnect = true;
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export function getDbError() {
  return lastDbError;
}

