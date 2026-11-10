import mongoose from "mongoose";
import connectDB from "./src/db/db.js";

try {
  await connectDB();
  console.log("Database connection test passed.");
} catch (error) {
  console.error("Database connection test failed.");
  console.error(error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
