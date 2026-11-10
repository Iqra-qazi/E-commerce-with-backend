import notificationModel from "../models/notification.model.js";
import orderModel from "../models/order.model.js";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";

async function getAdminSummary(req, res) {
  try {
    const [products, orders, users, unreadNotifications] = await Promise.all([
      productModel.countDocuments(),
      orderModel.countDocuments(),
      userModel.countDocuments({ role: "user" }),
      notificationModel.countDocuments({ readAt: { $exists: false } }),
    ]);
    return res.status(200).json({ products, orders, users, unreadNotifications });
  } catch (error) {
    console.error("Failed to load admin summary:", error);
    return res.status(500).json({ message: "Unable to load admin summary." });
  }
}

export { getAdminSummary };
