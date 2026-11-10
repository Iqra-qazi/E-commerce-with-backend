import express from "express";
import multer from "multer";
import { createProduct, getProducts } from "../controllers/product.controller.js";
import admin from "../middlewares/admin.js";
import requireAuth from "../middlewares/require-auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getProducts);
router.post("/", requireAuth, admin, upload.single("image"), createProduct);

export default router;