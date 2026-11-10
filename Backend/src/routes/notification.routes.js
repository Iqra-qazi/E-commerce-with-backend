import express from "express";
import {
  createCartActivity,
  getAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";
import admin from "../middlewares/admin.js";
import optionalAuth from "../middlewares/optional-auth.js";
import requireAuth from "../middlewares/require-auth.js";

const router = express.Router();

router.post("/cart-activity", optionalAuth, createCartActivity);
router.get("/", requireAuth, admin, getAdminNotifications);
router.patch("/read-all", requireAuth, admin, markAllNotificationsRead);
router.patch("/:notificationId/read", requireAuth, admin, markNotificationRead);

export default router;
