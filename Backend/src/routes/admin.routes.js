import express from "express";
import { getAdminSummary } from "../controllers/admin.controller.js";
import admin from "../middlewares/admin.js";
import requireAuth from "../middlewares/require-auth.js";

const router = express.Router();

router.get("/summary", requireAuth, admin, getAdminSummary);

export default router;
