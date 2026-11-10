import { api } from "./client";
import type { OrderRecord, OrderRequest, OrderStatus } from "../types/order";

export async function submitOrder(request: OrderRequest, idempotencyKey: string): Promise<OrderRecord> {
  const response = await api.post<{ order: OrderRecord }>("/orders", request, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  if (!response.data.order?._id || !response.data.order.orderNumber) {
    throw new Error("The server did not return a valid order confirmation.");
  }
  return response.data.order;
}

export async function getMyOrders(): Promise<OrderRecord[]> {
  const response = await api.get<{ orders: OrderRecord[] }>("/orders/mine");
  if (!Array.isArray(response.data.orders)) throw new Error("The server returned an invalid order list.");
  return response.data.orders;
}

export async function getAdminOrders(): Promise<OrderRecord[]> {
  const response = await api.get<{ orders: OrderRecord[] }>("/orders");
  if (!Array.isArray(response.data.orders)) throw new Error("The server returned an invalid order list.");
  return response.data.orders;
}

export async function getAdminOrder(orderId: string): Promise<OrderRecord> {
  const response = await api.get<{ order: OrderRecord }>(`/orders/${encodeURIComponent(orderId)}`);
  if (!response.data.order?._id) throw new Error("The server returned invalid order details.");
  return response.data.order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderRecord> {
  const response = await api.patch<{ order: OrderRecord }>(
    `/orders/${encodeURIComponent(orderId)}/status`,
    { status },
  );
  if (!response.data.order?._id) throw new Error("The server returned an invalid order update.");
  return response.data.order;
}
