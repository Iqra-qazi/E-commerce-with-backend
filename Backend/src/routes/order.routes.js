import express from "express";
import {
  createOrder,
  getAdminOrder,
  getAdminOrders,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import admin from "../middlewares/admin.js";
import requireAuth from "../middlewares/require-auth.js";

const router = express.Router();

router.post("/", requireAuth, createOrder);
router.get("/mine", requireAuth, getMyOrders);
router.get("/", requireAuth, admin, getAdminOrders);
router.get("/:orderId", requireAuth, admin, getAdminOrder);
router.patch("/:orderId/status", requireAuth, admin, updateOrderStatus);

export default router;
