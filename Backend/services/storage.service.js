import "dotenv/config";
import ImageKit from "@imagekit/nodejs";
import path from "node:path";

async function uploadfile(buffer, originalName) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError("Image upload requires a file Buffer.");
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY must be configured in the backend environment.");
  }

  const imageKit = new ImageKit({ privateKey });
  const safeName = path
    .basename(originalName || "product-image")
    .replace(/[^a-zA-Z0-9._-]/g, "_");

  return imageKit.files.upload({
    file: buffer.toString("base64"),
    fileName: `${Date.now()}-${safeName || "product-image"}`,
    folder: "products",
  });
}

export default uploadfile;
