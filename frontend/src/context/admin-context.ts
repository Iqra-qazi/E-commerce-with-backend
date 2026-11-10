import { createContext, useContext } from "react";
import type { AdminNotification } from "../api/notifications";

export type AdminContextValue = {
  notifications: AdminNotification[];
  unreadCount: number;
  loadingNotifications: boolean;
  notificationError: string | null;
  refreshNotifications: () => Promise<void>;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdminContext must be used within the admin layout.");
  return context;
}
