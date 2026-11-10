import "dotenv/config";
import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;
let serverlessConnectionPromise;

function getErrorDetails(error) {
  const details = [];
  const visited = new Set();
  const pending = [error];

  while (pending.length > 0) {
    const current = pending.shift();
    if (!current || typeof current !== "object" || visited.has(current)) {
      continue;
    }

    visited.add(current);

    const code = current.code ? ` (${current.code})` : "";
    if (current.message) {
      details.push(`${current.name || "Error"}${code}: ${current.message}`);
    } else if (current.code) {
      details.push(`MongoDB error${code}`);
    }

    for (const key of ["cause", "reason", "error", "originalError"]) {
      if (current[key]) {
        pending.push(current[key]);
      }
    }

    const servers = current.servers;
    if (servers instanceof Map) {
      for (const server of servers.values()) {
        if (server?.error) {
          pending.push(server.error);
        }
        if (server?.description?.error) {
          pending.push(server.description.error);
        }
      }
    }
  }

  return [...new Set(details)];
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not set. Add it to Backend/.env.");
  }

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt += 1) {
    try {
      console.log(`Connecting to MongoDB (attempt ${attempt}/${MAX_RETRIES + 1})...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        family: 4,
      });
      console.log("MongoDB connected successfully.");
      return;
    } catch (error) {
      const details = getErrorDetails(error);
      console.error(`MongoDB connection attempt ${attempt} failed.`);
      if (details.length > 0) {
        for (const detail of details) {
          console.error(`  ${detail}`);
        }
      } else {
        console.error(error);
      }

      const authFailed =
        error?.code === 18 ||
        details.some((detail) => /authentication failed|bad auth/i.test(detail));
      if (authFailed) {
        console.error(
          "Authentication failed. Check the Atlas database username/password and authSource."
        );
      }

      if (attempt > MAX_RETRIES) {
        console.error("MongoDB connection failed after 5 retries. Backend startup will stop.");
        throw error;
      }

      console.log("Retrying MongoDB connection in 5 seconds...");
      await wait(RETRY_DELAY_MS);
    }
  }
}

async function connectDBForServerless() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not configured.");
  }
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState !== 2) {
    serverlessConnectionPromise = undefined;
  }

  if (!serverlessConnectionPromise) {
    serverlessConnectionPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        family: 4,
      })
      .then(() => undefined)
      .catch((error) => {
        serverlessConnectionPromise = undefined;
        throw error;
      });
  }

  await serverlessConnectionPromise;
}

export { connectDBForServerless };
export default connectDB;
