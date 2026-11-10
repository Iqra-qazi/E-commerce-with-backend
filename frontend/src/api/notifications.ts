import { api } from "./client";

export type AdminNotification = {
  _id: string;
  type: "cart_added" | "new_order" | "order_status_updated";
  customerId: string;
  customerName: string;
  customerEmail: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  quantity?: number;
  orderId?: string;
  orderNumber?: string;
  orderStatus?: string;
  message: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
};

export async function recordCartActivity(productId: string, quantity: number): Promise<void> {
  await api.post("/notifications/cart-activity", { productId, quantity });
}

export async function getAdminNotifications() {
  const response = await api.get<{ notifications: AdminNotification[]; unreadCount: number }>("/notifications");
  if (!Array.isArray(response.data.notifications) || typeof response.data.unreadCount !== "number") {
    throw new Error("The server returned invalid notifications.");
  }
  return response.data;
}

export async function markAdminNotificationRead(notificationId: string): Promise<void> {
  await api.patch(`/notifications/${encodeURIComponent(notificationId)}/read`);
}

export async function markAllAdminNotificationsRead(): Promise<void> {
  await api.patch("/notifications/read-all");
}
