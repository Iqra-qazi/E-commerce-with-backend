import "dotenv/config";
import app from "./src/temp.js";
import connectDB from "./src/db/db.js";

const port = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

if (process.env.VERCEL !== "1") {
  startServer().catch((error) => {
    console.error("Backend startup aborted because MongoDB is unavailable.");
    console.error(error);
    process.exitCode = 1;
  });
}

export default app;
