import { api } from "./client";

export type AdminSummary = {
  products: number;
  orders: number;
  users: number;
  unreadNotifications: number;
};

export async function getAdminSummary(): Promise<AdminSummary> {
  const response = await api.get<AdminSummary>("/admin/summary");
  const summary = response.data;
  if (
    !summary ||
    !Number.isInteger(summary.products) ||
    !Number.isInteger(summary.orders) ||
    !Number.isInteger(summary.users) ||
    !Number.isInteger(summary.unreadNotifications)
  ) {
    throw new Error("The server returned invalid dashboard statistics.");
  }
  return summary;
}
