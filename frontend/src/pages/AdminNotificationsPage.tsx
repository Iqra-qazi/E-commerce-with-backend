import { Bell, Check, CheckCheck, LoaderCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminContext } from "../context/admin-context";
import type { AdminNotification } from "../api/notifications";
import { formatPrice } from "../utils/formatPrice";

function notificationTitle(notification: AdminNotification) {
  if (notification.type === "cart_added") return "Product added to cart";
  if (notification.type === "new_order") return "New order";
  return "Order status updated";
}

export function AdminNotificationsPage() {
  const {
    notifications,
    unreadCount,
    loadingNotifications,
    notificationError,
    refreshNotifications,
    markRead,
    markAllRead,
  } = useAdminContext();

  async function handleMarkRead(id: string) {
    try {
      await markRead(id);
    } catch {
      return;
    }
  }

  async function handleMarkAll() {
    try {
      await markAllRead();
    } catch {
      return;
    }
  }

  return (
    <main>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">STORE ACTIVITY</p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight text-stone-950">
            Notifications
            {unreadCount > 0 && <span className="rounded-full bg-pink-600 px-2.5 py-1 text-sm font-bold text-white">{unreadCount}</span>}
          </h1>
          <p className="mt-2 text-sm text-stone-500">Cart activity, new orders, and order status changes.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-700" onClick={() => void refreshNotifications()} type="button">
            <RefreshCw aria-hidden="true" size={15} /> Refresh
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-700 px-3 text-sm font-semibold text-white disabled:opacity-50" disabled={unreadCount === 0} onClick={() => void handleMarkAll()} type="button">
            <CheckCheck aria-hidden="true" size={15} /> Mark all read
          </button>
        </div>
      </header>
      {notificationError && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{notificationError}</span>
          <button className="font-semibold underline" onClick={() => void refreshNotifications()} type="button">Retry</button>
        </div>
      )}
      <section aria-label="Notifications" className="space-y-3">
        {loadingNotifications && notifications.length === 0 ? (
          <div className="grid min-h-40 place-items-center rounded-2xl border border-stone-200 bg-white text-sm text-stone-500"><span className="inline-flex items-center gap-2"><LoaderCircle className="animate-spin" size={16} />Loading notifications…</span></div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <Bell aria-hidden="true" className="mx-auto text-violet-500" size={26} />
            <p className="mt-3 font-semibold text-stone-800">You’re all caught up</p>
            <p className="mt-1 text-sm text-stone-500">Cart activity and order updates will appear here.</p>
          </div>
        ) : notifications.map((notification) => (
          <article className={`flex gap-4 rounded-2xl border p-4 shadow-sm sm:p-5 ${notification.readAt ? "border-stone-200 bg-white" : "border-violet-200 bg-violet-50/60 dark:border-violet-300/20 dark:bg-violet-400/5"}`} key={notification._id}>
            {notification.productImage ? (
              <img alt="" className="h-14 w-14 shrink-0 rounded-xl bg-stone-100 object-cover" src={notification.productImage} />
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-200">
                {notification.type === "cart_added" ? <Bell size={19} /> : <CheckCheck size={19} />}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-stone-900">{notificationTitle(notification)}</h2>
                {!notification.readAt && <span className="h-2 w-2 rounded-full bg-pink-600" aria-label="Unread" />}
              </div>
              <p className="mt-1 text-sm text-stone-600">{notification.message}</p>
              <p className="mt-2 text-xs text-stone-500">
                {notification.customerName} · {notification.customerEmail}
              </p>
              {notification.type === "cart_added" && (
                <p className="mt-1 text-xs font-medium text-stone-700">
                  {notification.productName} · {formatPrice(notification.productPrice ?? 0)} · Quantity {notification.quantity ?? 0}
                </p>
              )}
              {notification.orderNumber && (
                <p className="mt-1 text-xs font-medium text-stone-700">
                  {notification.orderNumber}{notification.orderStatus ? ` · ${notification.orderStatus}` : ""}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <time className="text-xs text-stone-500" dateTime={notification.updatedAt}>
                  {new Date(notification.updatedAt).toLocaleString("en-PK")}
                </time>
                {notification.orderId && (
                  <Link className="text-xs font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300" to={`/admin/orders/${notification.orderId}`}>
                    View order
                  </Link>
                )}
              </div>
            </div>
            {!notification.readAt && (
              <button
                aria-label={`Mark ${notificationTitle(notification)} as read`}
                className="grid h-9 w-9 shrink-0 place-items-center self-start rounded-lg text-violet-700 hover:bg-violet-100 dark:text-violet-200 dark:hover:bg-violet-400/10"
                onClick={() => void handleMarkRead(notification._id)}
                type="button"
              >
                <Check aria-hidden="true" size={17} />
              </button>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
