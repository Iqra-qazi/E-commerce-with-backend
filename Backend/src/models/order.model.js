import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    category: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    idempotencyKey: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      line1: { type: String, required: true },
      line2: { type: String, default: "" },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cod", "jazzcash", "easypaisa"],
      required: true,
    },
    items: { type: [orderItemSchema], required: true, validate: (items) => items.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    discountCode: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      index: true,
    },
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });

export default mongoose.model("order", orderSchema);
