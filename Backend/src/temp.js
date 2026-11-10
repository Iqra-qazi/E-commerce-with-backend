import "dotenv/config";
import express  from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { connectDBForServerless } from "./db/db.js";
import multer from "multer";

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const configuredFrontendOrigins = (process.env.FRONTEND_URL || (isProduction ? "" : "http://localhost:5173"))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => {
    try {
      return new URL(origin).origin;
    } catch {
      throw new Error(`Invalid frontend origin in FRONTEND_URL: ${origin}`);
    }
  });
if (isProduction && configuredFrontendOrigins.length === 0) {
  throw new Error("FRONTEND_URL must contain the deployed frontend origin in production.");
}
const developmentFrontendOrigins =
  process.env.NODE_ENV === "production"
    ? []
    : [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
      ];
const allowedFrontendOrigins = new Set([
  ...configuredFrontendOrigins,
  ...developmentFrontendOrigins,
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedFrontendOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use(async (req, res, next) => {
  if (process.env.VERCEL !== "1") {
    next();
    return;
  }

  try {
    await connectDBForServerless();
    next();
  } catch (error) {
    console.error("MongoDB is unavailable for this serverless request:", error);
    res.status(503).json({ message: "The service is temporarily unavailable. Please try again." });
  }
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes)
app.use("/api/product", productRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/admin", adminRoutes)

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  console.error("Unhandled API request error:", error);
  const status =
    error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
      ? 413
      : Number.isInteger(error.statusCode)
        ? error.statusCode
        : 500;
  res.status(status).json({
    message: status === 413 ? "Uploaded image must be 5 MB or smaller." : status === 415 ? error.message : "The request could not be completed.",
  });
});

export default app;