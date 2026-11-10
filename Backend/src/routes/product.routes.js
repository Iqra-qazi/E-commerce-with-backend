import express from "express";
import multer from "multer";
import { createProduct, getProducts } from "../controllers/product.controller.js";
import admin from "../middlewares/admin.js";
import requireAuth from "../middlewares/require-auth.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      const error = new Error("Only image files are supported.");
      error.statusCode = 415;
      callback(error);
      return;
    }
    callback(null, true);
  },
});

router.get("/", getProducts);
router.post("/", requireAuth, admin, upload.single("image"), createProduct);

export default router;