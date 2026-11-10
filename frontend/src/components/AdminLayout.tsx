import axios from "axios";
import { Bell, ClipboardList, LayoutDashboard, Package } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { toast } from "sonner";
import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  type AdminNotification,
} from "../api/notifications";
import { Navbar } from "./Navbar";
import { getErrorMessage } from "../utils/errors";
import { AdminContext, type AdminContextValue } from "../context/admin-context";

function isUnauthorized(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

function isForbidden(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 403;
}

function AdminNavLink({ to, icon, children, badge }: {
  to: string;
  icon: ReactNode;
  children: ReactNode;
  badge?: number;
}) {
  return (
    <NavLink
      className={({ isActive }) =>
        `inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
          isActive
            ? "bg-violet-100 text-violet-900 dark:bg-violet-400/15 dark:text-violet-100"
            : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/5"
        }`
      }
      end={to === "/admin"}
      to={to}
    >
      {icon}
      {children}
      {typeof badge === "number" && badge > 0 && (
        <span className="ml-auto min-w-5 rounded-full bg-pink-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </NavLink>
  );
}

export function AdminLayout() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  const refreshNotifications = useCallback(async () => {
    try {
      const result = await getAdminNotifications();
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
      setNotificationError(null);
    } catch (error) {
      if (isForbidden(error)) {
        toast.error("Admin access only");
      } else if (!isUnauthorized(error)) {
        setNotificationError(getErrorMessage(error, "Unable to refresh admin notifications."));
        console.error("Unable to refresh admin notifications:", error);
      }
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const result = await getAdminNotifications();
        if (!active) return;
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
        setNotificationError(null);
      } catch (error) {
        if (!active) return;
        if (isForbidden(error)) {
          toast.error("Admin access only");
        } else if (!isUnauthorized(error)) {
          setNotificationError(getErrorMessage(error, "Unable to refresh admin notifications."));
          console.error("Unable to refresh admin notifications:", error);
        }
      } finally {
        if (active) setLoadingNotifications(false);
      }
    };
    void poll();
    const timer = window.setInterval(() => void refreshNotifications(), 15_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [refreshNotifications]);

  const markRead = useCallback(async (notificationId: string) => {
    try {
      await markAdminNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((item) =>
          item._id === notificationId ? { ...item, readAt: new Date().toISOString() } : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      toast.error(isForbidden(error) ? "Admin access only" : getErrorMessage(error, "Unable to mark notification as read."));
      throw error;
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllAdminNotificationsRead();
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => ({ ...item, readAt })));
      setUnreadCount(0);
    } catch (error) {
      toast.error(isForbidden(error) ? "Admin access only" : getErrorMessage(error, "Unable to mark notifications as read."));
      throw error;
    }
  }, []);

  const context = useMemo<AdminContextValue>(
    () => ({
      notifications,
      unreadCount,
      loadingNotifications,
      notificationError,
      refreshNotifications,
      markRead,
      markAllRead,
    }),
    [notifications, unreadCount, loadingNotifications, notificationError, refreshNotifications, markRead, markAllRead],
  );
  const unreadOrders = notifications.filter(
    (notification) => notification.type === "new_order" && !notification.readAt,
  ).length;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 pb-12 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside aria-label="Admin navigation" className="flex gap-2 overflow-x-auto rounded-2xl border border-stone-200 bg-white p-2 shadow-sm lg:flex-col lg:self-start">
          <AdminNavLink icon={<LayoutDashboard aria-hidden="true" size={17} />} to="/admin">
            Dashboard
          </AdminNavLink>
          <AdminNavLink icon={<Package aria-hidden="true" size={17} />} to="/admin/products">
            Products
          </AdminNavLink>
          <AdminNavLink badge={unreadOrders} icon={<ClipboardList aria-hidden="true" size={17} />} to="/admin/orders">
            Orders
          </AdminNavLink>
          <AdminNavLink badge={unreadCount} icon={<Bell aria-hidden="true" size={17} />} to="/admin/notifications">
            Notifications
          </AdminNavLink>
        </aside>
        <AdminContext.Provider value={context}>
          <div className="min-w-0">
            <Outlet />
          </div>
        </AdminContext.Provider>
      </div>
    </div>
  );
}
