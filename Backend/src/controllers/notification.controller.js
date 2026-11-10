import mongoose from "mongoose";
import notificationModel from "../models/notification.model.js";
import productModel from "../models/product.model.js";

async function createCartActivity(req, res) {
  const { productId, quantity, guestSessionId } = req.body ?? {};
  const customer = req.user;
  const validGuestSessionId =
    typeof guestSessionId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(guestSessionId);
  if (
    !mongoose.isValidObjectId(productId) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 100 ||
    (!customer && !validGuestSessionId)
  ) {
    return res.status(400).json({ message: "A valid product ID and quantity are required." });
  }

  try {
    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found." });
    if (product.stock < quantity) {
      return res.status(409).json({ message: "The requested quantity is no longer in stock." });
    }

    const identity = customer
      ? { customerId: customer._id }
      : { guestSessionId };
    const cartNotification = await notificationModel.findOneAndUpdate(
      { type: "cart_added", ...identity, productId: product._id },
      {
        $set: {
          customerName: customer?.username ?? "Guest customer",
          customerEmail: customer?.email ?? "Guest visitor",
          productName: product.name,
          productImage: product.image,
          productPrice: product.price,
          message: "A customer added a product to their cart.",
        },
        $inc: { quantity },
        $setOnInsert: { type: "cart_added", ...identity, productId: product._id },
        $unset: { readAt: 1 },
      },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return res.status(202).json({ notificationId: cartNotification._id });
  } catch (error) {
    console.error("Failed to record cart activity:", error);
    if (error?.code === 11000) {
      try {
        const existing = await notificationModel.findOneAndUpdate(
          { type: "cart_added", ...identity, productId },
          { $inc: { quantity }, $unset: { readAt: 1 }, $set: { updatedAt: new Date() } },
          { returnDocument: "after", runValidators: true },
        );
        if (existing) return res.status(202).json({ notificationId: existing._id });
      } catch (retryError) {
        console.error("Failed to merge duplicate cart activity:", retryError);
      }
    }
    return res.status(500).json({ message: "Unable to notify the store about cart activity." });
  }
}

async function getAdminNotifications(req, res) {
  try {
    const [notifications, unreadCount] = await Promise.all([
      notificationModel.find().sort({ updatedAt: -1 }).limit(100).lean(),
      notificationModel.countDocuments({ readAt: { $exists: false } }),
    ]);
    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error("Failed to load admin notifications:", error);
    return res.status(500).json({ message: "Unable to load notifications." });
  }
}

async function markNotificationRead(req, res) {
  if (!mongoose.isValidObjectId(req.params.notificationId)) {
    return res.status(400).json({ message: "Invalid notification ID." });
  }

  try {
    const notification = await notificationModel.findByIdAndUpdate(
      req.params.notificationId,
      { $set: { readAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!notification) return res.status(404).json({ message: "Notification not found." });
    return res.status(200).json({ notification });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return res.status(500).json({ message: "Unable to update notification." });
  }
}

async function markAllNotificationsRead(req, res) {
  try {
    const result = await notificationModel.updateMany(
      { readAt: { $exists: false } },
      { $set: { readAt: new Date() } },
    );
    return res.status(200).json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return res.status(500).json({ message: "Unable to update notifications." });
  }
}

export { createCartActivity, getAdminNotifications, markAllNotificationsRead, markNotificationRead };
