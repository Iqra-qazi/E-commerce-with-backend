import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { getJwtSecret } from "../utils/jwt.js";

async function requireAuth(req, res, next) {
  const authorization = req.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (typeof payload !== "object" || typeof payload.id !== "string") {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    const user = await userModel.findById(payload.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.authUserId = payload.id;
    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Invalid or expired authentication token" });
    }

    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default requireAuth;
