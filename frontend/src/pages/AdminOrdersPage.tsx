import axios from "axios";
import { ArrowUpRight, LoaderCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminOrders } from "../api/orders";
import type { OrderRecord } from "../types/order";
import { formatPrice } from "../utils/formatPrice";
import { getErrorMessage } from "../utils/errors";

function statusStyle(status: string) {
  if (status === "Delivered") return "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300";
  if (status === "Cancelled") return "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300";
  if (status === "Shipped") return "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300";
  return "bg-violet-50 text-violet-800 dark:bg-violet-400/10 dark:text-violet-200";
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await getAdminOrders());
      setError(null);
    } catch (requestError) {
      if (!(axios.isAxiosError(requestError) && requestError.response?.status === 401)) {
        setError(getErrorMessage(requestError, "Unable to load orders."));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAdminOrders()
      .then((result) => {
        if (active) {
          setOrders(result);
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (active && !(axios.isAxiosError(requestError) && requestError.response?.status === 401)) {
          setError(getErrorMessage(requestError, "Unable to load orders."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function refreshOrders() {
    setLoading(true);
    void loadOrders();
  }

  return (
    <main>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">STORE MANAGEMENT</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Orders</h1>
          <p className="mt-2 text-sm text-stone-500">Review customer purchases and fulfillment progress.</p>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-700" onClick={refreshOrders} type="button">
          <RefreshCw aria-hidden="true" size={15} /> Refresh
        </button>
      </header>
      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {loading ? (
          <div className="grid min-h-48 place-items-center text-sm text-stone-500"><span className="inline-flex items-center gap-2"><LoaderCircle className="animate-spin" size={16} />Loading orders…</span></div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button className="mt-4 rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white" onClick={refreshOrders} type="button">Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <p className="p-10 text-center text-sm text-stone-500">No orders have been placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Items</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Status</th><th className="px-5 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-5 py-4 font-semibold text-stone-900">{order.orderNumber}</td>
                    <td className="px-5 py-4"><span className="block font-medium text-stone-800">{order.customer.name}</span><span className="mt-1 block text-xs text-stone-500">{order.customer.email}</span></td>
                    <td className="px-5 py-4 text-stone-600">{new Date(order.createdAt).toLocaleString("en-PK")}</td>
                    <td className="px-5 py-4 text-stone-600">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                    <td className="px-5 py-4 font-semibold text-stone-800">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(order.status)}`}>{order.status}</span></td>
                    <td className="px-5 py-4"><Link aria-label={`View order ${order.orderNumber}`} className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300" to={`/admin/orders/${order._id}`}>Details <ArrowUpRight size={14} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
