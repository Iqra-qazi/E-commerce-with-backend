import "dotenv/config";
import express  from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
const configuredFrontendOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
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

app.use("/api/auth", authRoutes)
app.use("/api/product", productRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/admin", adminRoutes)

export default app;