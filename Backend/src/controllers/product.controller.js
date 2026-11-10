import productModel from "../models/product.model.js";
import uploadfile from "../../services/storage.service.js";

async function getProducts(req, res) {
  try {
    const products = await productModel.find().sort({ _id: -1 });
    res.status(200).json({ products });
  } catch (error) {
    console.error("Failed to load products:", error);
    res.status(500).json({ message: "Unable to load products." });
  }
}

async function createProduct(req, res) {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const rawPrice = req.body.price;
    const price = rawPrice === "" || rawPrice == null ? Number.NaN : Number(rawPrice);

    if (!name || !Number.isFinite(price) || price < 0) {
      return res.status(400).json({ message: "A product name and valid price are required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required." });
    }

    const rawStock = req.body.stock;
    const stock = rawStock === "" || rawStock == null ? 0 : Number(rawStock);
    if (!Number.isFinite(stock) || stock < 0) {
      return res.status(400).json({ message: "Stock must be a non-negative number." });
    }

    let imageResult;
    try {
      imageResult = await uploadfile(req.file.buffer, req.file.originalname);
    } catch (error) {
      console.error("Failed to upload product image:", error);
      return res.status(502).json({ message: "Unable to upload product image." });
    }

    if (!imageResult?.url || !imageResult?.fileId) {
      console.error("ImageKit upload returned no URL or file ID:", imageResult);
      return res.status(502).json({ message: "Image service returned an invalid response." });
    }

    const product = await productModel.create({
      name,
      description: typeof req.body.description === "string" ? req.body.description.trim() : "",
      price,
      stock,
      category: typeof req.body.category === "string" ? req.body.category.trim() : undefined,
      image: imageResult.url,
      imageFileId: imageResult.fileId,
    });

    return res.status(201).json({ product });
  } catch (error) {
    console.error("Failed to create product:", error);
    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Unable to create product." });
  }
}

export { getProducts, createProduct };