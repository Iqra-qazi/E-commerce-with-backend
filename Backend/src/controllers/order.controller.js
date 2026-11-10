import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import notificationModel from "../models/notification.model.js";
import orderModel from "../models/order.model.js";
import productModel from "../models/product.model.js";

const PAYMENT_METHODS = new Set(["card", "cod", "jazzcash", "easypaisa"]);
const ORDER_STATUSES = new Set(["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]);
const DELIVERY_FEE = 250;
const FREE_DELIVERY_THRESHOLD = 5000;

function isNonEmptyString(value, maxLength = 200) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

function isValidOrderInput(body) {
  const { customer, shippingAddress, paymentMethod, items } = body ?? {};
  return Boolean(
    customer &&
      isNonEmptyString(customer.name, 100) &&
      isNonEmptyString(customer.email, 254) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()) &&
      isNonEmptyString(customer.phone, 30) &&
      customer.phone.trim().length >= 7 &&
      shippingAddress &&
      isNonEmptyString(shippingAddress.line1, 200) &&
      (shippingAddress.line2 === undefined || typeof shippingAddress.line2 === "string") &&
      isNonEmptyString(shippingAddress.city, 100) &&
      isNonEmptyString(shippingAddress.province, 100) &&
      isNonEmptyString(shippingAddress.postalCode, 30) &&
      isNonEmptyString(shippingAddress.country, 100) &&
      PAYMENT_METHODS.has(paymentMethod) &&
      Array.isArray(items) &&
      items.length > 0 &&
      items.length <= 50,
  );
}

function normalizeItems(items) {
  const quantities = new Map();
  for (const item of items) {
    if (
      !item ||
      typeof item.productId !== "string" ||
      !mongoose.isValidObjectId(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 100
    ) {
      return null;
    }

    const productId = item.productId;
    const quantity = (quantities.get(productId) ?? 0) + item.quantity;
    if (quantity > 100) return null;
    quantities.set(productId, quantity);
  }

  return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
}

function newOrderNumber() {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function publicOrder(order) {
  return {
    _id: order._id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customer: order.customer,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    items: order.items,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    discount: order.discount,
    total: order.total,
    discountCode: order.discountCode,
    status: order.status,
  };
}

async function createOrder(req, res) {
  const idempotencyKey = req.get("Idempotency-Key")?.trim();
  if (!idempotencyKey || idempotencyKey.length > 100) {
    return res.status(400).json({ message: "A valid Idempotency-Key header is required." });
  }
  if (!isValidOrderInput(req.body)) {
    return res.status(400).json({ message: "Order details are incomplete or invalid." });
  }

  const items = normalizeItems(req.body.items);
  if (!items) {
    return res.status(400).json({ message: "Order items must contain valid product IDs and quantities." });
  }

  const discountCode =
    typeof req.body.discountCode === "string" ? req.body.discountCode.trim().toUpperCase() : "";
  if (discountCode && discountCode !== "WELCOME10") {
    return res.status(400).json({ message: "The discount code is not valid." });
  }

  let session;
  let order;
  let created = false;
  try {
    const existing = await orderModel.findOne({ userId: req.authUserId, idempotencyKey });
    if (existing) return res.status(200).json({ order: publicOrder(existing) });

    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const duplicate = await orderModel.findOne({ userId: req.authUserId, idempotencyKey }).session(session);
      if (duplicate) {
        order = duplicate;
        return;
      }

      const productIds = items.map((item) => item.productId);
      const products = await productModel.find({ _id: { $in: productIds } }).session(session);
      if (products.length !== items.length) {
        const error = new Error("One or more products are no longer available.");
        error.statusCode = 400;
        throw error;
      }

      const productById = new Map(products.map((product) => [product._id.toString(), product]));
      const orderItems = items.map(({ productId, quantity }) => {
        const product = productById.get(productId);
        if (!product || product.stock < quantity) {
          const error = new Error(`${product?.name ?? "A product"} does not have enough stock.`);
          error.statusCode = 409;
          throw error;
        }

        return {
          productId: product._id,
          name: product.name,
          image: product.image,
          category: product.category,
          price: product.price,
          quantity,
          lineTotal: product.price * quantity,
        };
      });

      const subtotal = Math.round(orderItems.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
      const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
      const discount = discountCode === "WELCOME10" ? Math.round(subtotal * 10) / 100 : 0;
      const [savedOrder] = await orderModel.create(
        [
          {
            orderNumber: newOrderNumber(),
            idempotencyKey,
            userId: req.authUserId,
            customer: {
              name: req.body.customer.name.trim(),
              email: req.body.customer.email.trim().toLowerCase(),
              phone: req.body.customer.phone.trim(),
            },
            shippingAddress: {
              line1: req.body.shippingAddress.line1.trim(),
              line2: (req.body.shippingAddress.line2 ?? "").trim(),
              city: req.body.shippingAddress.city.trim(),
              province: req.body.shippingAddress.province.trim(),
              postalCode: req.body.shippingAddress.postalCode.trim(),
              country: req.body.shippingAddress.country.trim(),
            },
            paymentMethod: req.body.paymentMethod,
            items: orderItems,
            subtotal,
            deliveryFee,
            discount,
            total: Math.max(0, subtotal + deliveryFee - discount),
            discountCode,
          },
        ],
        { session },
      );

      for (const item of items) {
        const inventoryUpdate = await productModel.updateOne(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session },
        );
        if (inventoryUpdate.modifiedCount !== 1) {
          const error = new Error("Stock changed while placing the order. Please review your cart.");
          error.statusCode = 409;
          throw error;
        }
      }

      const customer = req.user;
      await notificationModel.create(
        [
          {
            type: "new_order",
            customerId: customer._id,
            customerName: savedOrder.customer.name,
            customerEmail: savedOrder.customer.email,
            orderId: savedOrder._id,
            orderNumber: savedOrder.orderNumber,
            orderStatus: savedOrder.status,
            message: `New order ${savedOrder.orderNumber} was placed.`,
          },
        ],
        { session },
      );

      order = savedOrder;
      created = true;
    });

    return res.status(created ? 201 : 200).json({ order: publicOrder(order) });
  } catch (error) {
    if (error?.code === 11000) {
      try {
        const duplicate = await orderModel.findOne({ userId: req.authUserId, idempotencyKey });
        if (duplicate) return res.status(200).json({ order: publicOrder(duplicate) });
      } catch (lookupError) {
        console.error("Failed to load a duplicate order submission:", lookupError);
      }
    }

    console.error("Failed to create order:", error);
    if (error?.statusCode) return res.status(error.statusCode).json({ message: error.message });
    if (error?.name === "ValidationError") return res.status(400).json({ message: error.message });
    return res.status(500).json({ message: "Unable to place your order." });
  } finally {
    if (session) await session.endSession();
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await orderModel.find({ userId: req.authUserId }).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ orders: orders.map(publicOrder) });
  } catch (error) {
    console.error("Failed to load customer orders:", error);
    return res.status(500).json({ message: "Unable to load your orders." });
  }
}

async function getAdminOrders(req, res) {
  try {
    const orders = await orderModel.find().sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ orders: orders.map(publicOrder) });
  } catch (error) {
    console.error("Failed to load admin orders:", error);
    return res.status(500).json({ message: "Unable to load orders." });
  }
}

async function getAdminOrder(req, res) {
  if (!mongoose.isValidObjectId(req.params.orderId)) {
    return res.status(400).json({ message: "Invalid order ID." });
  }

  try {
    const order = await orderModel.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found." });
    return res.status(200).json({ order: publicOrder(order) });
  } catch (error) {
    console.error("Failed to load order details:", error);
    return res.status(500).json({ message: "Unable to load order details." });
  }
}

async function updateOrderStatus(req, res) {
  const { status } = req.body ?? {};
  if (!mongoose.isValidObjectId(req.params.orderId) || !ORDER_STATUSES.has(status)) {
    return res.status(400).json({ message: "A valid order ID and status are required." });
  }

  let session;
  try {
    session = await mongoose.startSession();
    let updatedOrder;
    await session.withTransaction(async () => {
      const order = await orderModel.findById(req.params.orderId).session(session);
      if (!order) {
        const error = new Error("Order not found.");
        error.statusCode = 404;
        throw error;
      }
      if (order.status === status) {
        updatedOrder = order;
        return;
      }
      if (order.status === "Cancelled") {
        const error = new Error("A cancelled order cannot be reopened.");
        error.statusCode = 409;
        throw error;
      }

      order.status = status;
      await order.save({ session });
      if (status === "Cancelled") {
        for (const item of order.items) {
          await productModel.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity } },
            { session },
          );
        }
      }
      await notificationModel.create(
        [
          {
            type: "order_status_updated",
            customerId: order.userId,
            customerName: order.customer.name,
            customerEmail: order.customer.email,
            orderId: order._id,
            orderNumber: order.orderNumber,
            orderStatus: status,
            message: `Order ${order.orderNumber} status changed to ${status}.`,
          },
        ],
        { session },
      );
      updatedOrder = order;
    });

    return res.status(200).json({ order: publicOrder(updatedOrder) });
  } catch (error) {
    console.error("Failed to update order status:", error);
    if (error?.statusCode) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: "Unable to update order status." });
  } finally {
    if (session) await session.endSession();
  }
}

export { createOrder, getAdminOrder, getAdminOrders, getMyOrders, updateOrderStatus };
