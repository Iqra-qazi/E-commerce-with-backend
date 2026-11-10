import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["cart_added", "new_order", "order_status_updated"],
      required: true,
      index: true,
    },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "user", index: true },
    guestSessionId: { type: String },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
    productName: { type: String, default: "" },
    productImage: { type: String, default: "" },
    productPrice: { type: Number, min: 0 },
    quantity: { type: Number, min: 1 },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "order" },
    orderNumber: { type: String, default: "" },
    orderStatus: { type: String, default: "" },
    message: { type: String, required: true },
    readAt: { type: Date },
  },
  { timestamps: true },
);

notificationSchema.index(
  { customerId: 1, productId: 1 },
  { unique: true, partialFilterExpression: { type: "cart_added", customerId: { $type: "objectId" } } },
);
notificationSchema.index(
  { guestSessionId: 1, productId: 1 },
  { unique: true, partialFilterExpression: { type: "cart_added", guestSessionId: { $type: "string" } } },
);
notificationSchema.index({ createdAt: -1 });

export default mongoose.model("notification", notificationSchema);
