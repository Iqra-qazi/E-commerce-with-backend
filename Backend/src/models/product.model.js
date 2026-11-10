import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      default: "Learning",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    imageFileId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const productModel = mongoose.model("product", productSchema);

export default productModel;
