import confetti from "canvas-confetti";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Download, MapPin, PackageCheck } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { OrderTimeline } from "../components/OrderTimeline";
import { SuccessCheckmark } from "../components/SuccessCheckmark";
import { ThankYouNote } from "../components/ThankYouNote";
import type { OrderConfirmation } from "../types/order";
import { formatPrice } from "../utils/formatPrice";

function formatAddress(address: OrderConfirmation["shippingAddress"]) {
  return [
    address.line1,
    address.line2,
    address.city,
    address.province,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const state = location.state as { order?: OrderConfirmation } | null;
  const order = state?.order;

  useEffect(() => {
    if (!order || reduceMotion) return;

    const burst = (origin: number, angle: number) =>
      confetti({
        particleCount: 48,
        spread: 58,
        startVelocity: 42,
        origin: { x: origin, y: 0.62 },
        angle,
        colors: ["#8b5cf6", "#d946ef", "#ec4899", "#ffffff"],
        disableForReducedMotion: true,
      });

    const first = window.setTimeout(() => {
      burst(0.18, 60);
      burst(0.82, 120);
    }, 350);
    const second = window.setTimeout(() => {
      confetti({
        particleCount: 35,
        spread: 90,
        origin: { x: 0.5, y: 0.45 },
        colors: ["#8b5cf6", "#d946ef", "#ec4899"],
        disableForReducedMotion: true,
      });
    }, 800);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [order, reduceMotion]);

  if (!order) {
    return (
      <div className="premium-page min-h-screen bg-[#f7faf8] dark:bg-[#0b1110]">
        <Navbar />
        <main className="mx-auto max-w-xl px-6 py-20 text-center">
          <PackageCheck aria-hidden="true" className="mx-auto text-violet-600" size={44} />
          <h1 className="mt-5 text-2xl font-semibold text-stone-900 dark:text-white">Order details aren’t available</h1>
          <p className="mt-3 text-sm leading-6 text-stone-500 dark:text-stone-400">
            Open this page after placing an order to view its confirmation.
          </p>
          <button
            className="motion-button mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white"
            onClick={() => navigate("/products", { replace: true })}
            type="button"
          >
            Browse products
          </button>
        </main>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);
  const paymentName = {
    card: "Card (not processed here)",
    cod: "Cash on Delivery",
    jazzcash: "JazzCash",
    easypaisa: "Easypaisa",
  }[order.paymentMethod];
  const detailItems = [
    { label: "Order number", value: `#${order.orderNumber}` },
    { label: "Date placed", value: orderDate.toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) },
    { label: "Payment method", value: paymentName },
    { label: "Estimated delivery", value: new Date(order.estimatedDelivery).toLocaleDateString("en-PK", { dateStyle: "medium" }) },
  ];

  return (
    <div className="premium-page min-h-screen overflow-hidden bg-[#f7faf8] text-stone-900 transition-colors dark:bg-[#0b1110] dark:text-stone-100">
      <div aria-hidden="true" className="gradient-orb gradient-orb-one" />
      <div aria-hidden="true" className="gradient-orb gradient-orb-two" />
      <Navbar />
      <main className="relative mx-auto max-w-5xl px-5 pb-16 pt-3 sm:px-6">
        <SuccessCheckmark />
        <ThankYouNote name={order.customer.name} email={order.customer.email} orderNumber={order.orderNumber} />

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel mx-auto mt-9 max-w-4xl rounded-3xl p-5 sm:p-8"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col justify-between gap-2 border-b border-stone-200 pb-5 dark:border-white/10 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow">ORDER DETAILS</p>
              <h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-white">The details, at a glance</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:bg-violet-400/10 dark:text-violet-300 sm:self-auto">
              <PackageCheck aria-hidden="true" size={14} />
              {order.status}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {detailItems.map((item, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-stone-200/80 bg-white/65 p-4 dark:border-white/10 dark:bg-stone-950/20"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                key={item.label}
                transition={{ duration: 0.35, delay: 0.38 + index * 0.08 }}
              >
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">{item.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-stone-200/80 bg-white/65 p-4 dark:border-white/10 dark:bg-stone-950/20">
            <p className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
              <MapPin aria-hidden="true" size={15} />
              DELIVERY ADDRESS
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-800 dark:text-stone-100">{formatAddress(order.shippingAddress)}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-white">Items in this order</h3>
            <div className="mt-3 divide-y divide-stone-200 dark:divide-white/10">
              {order.items.map(({ product, quantity }, index) => (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 py-3"
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  key={product._id}
                  transition={{ duration: 0.3, delay: 0.55 + index * 0.06 }}
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-white/10">
                    {product.image && <img alt="" className="h-full w-full object-cover" src={product.image} />}
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800 dark:text-stone-100">{product.name}</p>
                  <span className="text-xs text-stone-500 dark:text-stone-400">× {quantity}</span>
                  <span className="text-sm font-semibold text-stone-900 dark:text-white">{formatPrice(product.price * quantity)}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-base font-bold text-stone-950 dark:border-white/10 dark:text-white">
            <span>Total paid / due</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </motion.section>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-6 max-w-4xl"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <OrderTimeline orderDate={order.createdAt} />
        </motion.div>

        <div className="no-print mx-auto mt-7 flex max-w-4xl flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="motion-button inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-900/15"
            to="/products"
          >
            Continue shopping <ArrowRight aria-hidden="true" size={17} />
          </Link>
          <a
            className="motion-button inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white/75 px-5 text-sm font-semibold text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-100"
            href="#order-tracking"
          >
            Track order
          </a>
          <button
            className="motion-button inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white/75 px-5 text-sm font-semibold text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-stone-100"
            onClick={() => window.print()}
            type="button"
          >
            <Download aria-hidden="true" size={16} />
            Download / print receipt
          </button>
        </div>
        <p className="no-print mt-7 text-center text-xs text-stone-500 dark:text-stone-500">
          Thank you for choosing atelier. We hope you love your order.
        </p>
      </main>
    </div>
  );
}
