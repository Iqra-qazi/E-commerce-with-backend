import axios from "axios";
import { ArrowLeft, LoaderCircle, MapPin, PackageCheck, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdminOrder, updateOrderStatus } from "../api/orders";
import type { OrderRecord, OrderStatus } from "../types/order";
import { formatPrice } from "../utils/formatPrice";
import { getErrorMessage } from "../utils/errors";
import { toast } from "sonner";

const statuses: OrderStatus[] = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

function isUnauthorized(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function AdminOrderDetailPage() {
  const { orderId = "" } = useParams();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const loadOrder = useCallback(async () => {
    try {
      setOrder(await getAdminOrder(orderId));
      setError(null);
    } catch (requestError) {
      if (!isUnauthorized(requestError)) setError(getErrorMessage(requestError, "Unable to load order details."));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    let active = true;
    getAdminOrder(orderId)
      .then((result) => {
        if (active) {
          setOrder(result);
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (active && !isUnauthorized(requestError)) {
          setError(getErrorMessage(requestError, "Unable to load order details."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  function refreshOrder() {
    setLoading(true);
    void loadOrder();
  }

  async function changeStatus(status: OrderStatus) {
    if (!order || status === order.status) return;
    setSavingStatus(true);
    try {
      const updated = await updateOrderStatus(order._id, status);
      setOrder(updated);
      toast.success(`Order status updated to ${status}.`);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to update order status."));
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <main>
      <Link className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-violet-700 dark:text-stone-300" to="/admin/orders">
        <ArrowLeft aria-hidden="true" size={16} /> Back to orders
      </Link>
      {loading ? (
        <div className="grid min-h-48 place-items-center text-sm text-stone-500"><span className="inline-flex items-center gap-2"><LoaderCircle className="animate-spin" size={16} />Loading order…</span></div>
      ) : error || !order ? (
        <section className="rounded-2xl border border-red-200 bg-white p-8 text-center">
          <p className="text-sm text-red-700">{error ?? "Order not found."}</p>
          <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white" onClick={refreshOrder} type="button"><RefreshCw size={15} /> Retry</button>
        </section>
      ) : (
        <>
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">ORDER DETAILS</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{order.orderNumber}</h1>
              <p className="mt-2 text-sm text-stone-500">Placed {new Date(order.createdAt).toLocaleString("en-PK")}</p>
            </div>
            <label className="text-sm font-semibold text-stone-700">
              Order status
              <select
                className="mt-2 block h-11 min-w-48 rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                disabled={savingStatus || order.status === "Cancelled"}
                onChange={(event) => void changeStatus(event.target.value as OrderStatus)}
                value={order.status}
              >
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
          </header>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
            <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-100 px-5 py-4"><h2 className="font-semibold text-stone-900">Items</h2></div>
              <div className="divide-y divide-stone-100">
                {order.items.map((item) => (
                  <div className="flex items-center gap-3 p-5" key={item.productId}>
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                      {item.image && <img alt="" className="h-full w-full object-cover" src={item.image} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-900">{item.name}</p>
                      <p className="mt-1 text-xs text-stone-500">{item.category || "General"} · {formatPrice(item.price)} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-stone-800">{formatPrice(item.lineTotal)}</p>
                  </div>
                ))}
              </div>
              <dl className="space-y-2 border-t border-stone-100 p-5 text-sm">
                <div className="flex justify-between text-stone-600"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
                <div className="flex justify-between text-stone-600"><dt>Delivery</dt><dd>{order.deliveryFee ? formatPrice(order.deliveryFee) : "Free"}</dd></div>
                {order.discount > 0 && <div className="flex justify-between text-violet-700"><dt>Discount</dt><dd>−{formatPrice(order.discount)}</dd></div>}
                <div className="flex justify-between border-t border-stone-100 pt-3 text-base font-bold text-stone-950"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
              </dl>
            </section>
            <div className="space-y-5">
              <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-stone-900">Customer</h2>
                <p className="mt-4 text-sm font-semibold text-stone-800">{order.customer.name}</p>
                <p className="mt-1 text-sm text-stone-600">{order.customer.email}</p>
                <p className="mt-1 text-sm text-stone-600">{order.customer.phone}</p>
              </section>
              <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 font-semibold text-stone-900"><MapPin size={16} />Delivery address</h2>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  {[order.shippingAddress.line1, order.shippingAddress.line2, order.shippingAddress.city, order.shippingAddress.province, order.shippingAddress.postalCode, order.shippingAddress.country].filter(Boolean).join(", ")}
                </p>
              </section>
              <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 font-semibold text-stone-900"><PackageCheck size={16} />Payment</h2>
                <p className="mt-3 text-sm capitalize text-stone-600">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</p>
              </section>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
