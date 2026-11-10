import axios from "axios";
import { LoaderCircle, PackageCheck, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../api/orders";
import { Navbar } from "../components/Navbar";
import type { OrderRecord } from "../types/order";
import { formatPrice } from "../utils/formatPrice";
import { getErrorMessage } from "../utils/errors";

function isUnauthorized(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

function statusColor(status: OrderRecord["status"]) {
  if (status === "Delivered") return "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300";
  if (status === "Cancelled") return "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300";
  if (status === "Shipped") return "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300";
  return "bg-violet-50 text-violet-800 dark:bg-violet-400/10 dark:text-violet-200";
}

export function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await getMyOrders());
      setError(null);
    } catch (requestError) {
      if (!isUnauthorized(requestError)) setError(getErrorMessage(requestError, "Unable to load your orders."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const pollOrders = async () => {
      try {
        const result = await getMyOrders();
        if (active) {
          setOrders(result);
          setError(null);
        }
      } catch (requestError) {
        if (active && !isUnauthorized(requestError)) {
          setError(getErrorMessage(requestError, "Unable to load your orders."));
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void pollOrders();
    const timer = window.setInterval(() => void pollOrders(), 20_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  function refreshOrders() {
    setLoading(true);
    void loadOrders();
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">YOUR ACCOUNT</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">My orders</h1>
            <p className="mt-2 text-sm text-stone-500">Order status refreshes automatically while this page is open.</p>
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-700" onClick={refreshOrders} type="button">
            <RefreshCw aria-hidden="true" size={15} /> Refresh
          </button>
        </header>
        {loading && orders.length === 0 ? (
          <div className="grid min-h-48 place-items-center rounded-2xl border border-stone-200 bg-white text-sm text-stone-500">
            <span className="inline-flex items-center gap-2"><LoaderCircle className="animate-spin" size={16} />Loading your orders…</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button className="mt-4 rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white" onClick={refreshOrders} type="button">Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <PackageCheck aria-hidden="true" className="mx-auto text-violet-600" size={30} />
            <h2 className="mt-3 font-semibold text-stone-900">No orders yet</h2>
            <p className="mt-1 text-sm text-stone-500">Your confirmed orders will appear here.</p>
            <Link className="mt-5 inline-flex rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white" to="/products">Browse products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" key={order._id}>
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="font-semibold text-stone-900">{order.orderNumber}</h2>
                    <p className="mt-1 text-xs text-stone-500">Placed {new Date(order.createdAt).toLocaleString("en-PK")}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(order.status)}`}>{order.status}</span>
                </header>
                <div className="divide-y divide-stone-100">
                  {order.items.map((item) => (
                    <div className="flex items-center gap-3 py-3" key={item.productId}>
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                        {item.image && <img alt="" className="h-full w-full object-cover" src={item.image} />}
                      </div>
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800">{item.name}</p>
                      <span className="text-xs text-stone-500">× {item.quantity}</span>
                      <span className="text-sm font-semibold text-stone-800">{formatPrice(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
                <footer className="flex justify-between border-t border-stone-100 pt-4 text-sm">
                  <span className="text-stone-500">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</span>
                  <span className="font-bold text-stone-900">Total {formatPrice(order.total)}</span>
                </footer>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
