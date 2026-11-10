import express from "express";
import { getCurrentUser, loginUser, registerUser } from "../controllers/auth.controller.js";
import requireAuth from "../middlewares/require-auth.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", requireAuth, getCurrentUser);

export default router;