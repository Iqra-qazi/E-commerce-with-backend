import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Leaf, ShieldCheck } from "lucide-react";
import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { submitOrder } from "../api/orders";
import { CheckoutForm } from "../components/CheckoutForm";
import { Navbar } from "../components/Navbar";
import { OrderSummary } from "../components/OrderSummary";
import { StepIndicator } from "../components/StepIndicator";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { getErrorMessage } from "../utils/errors";
import type { OrderConfirmation, OrderCustomer, PaymentMethod, ShippingAddress } from "../types/order";

const DELIVERY_FEE = 250;
const FREE_DELIVERY_THRESHOLD = 5000;
const DISCOUNT_CODE = "WELCOME10";

function getEstimatedDelivery(date: Date) {
  const estimated = new Date(date);
  estimated.setDate(estimated.getDate() + 5);
  return estimated.toISOString();
}

function getOrderIdempotencyKey() {
  const storageKey = "atelier_order_idempotency_key";
  try {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) return saved;
    const created = crypto.randomUUID();
    sessionStorage.setItem(storageKey, created);
    return created;
  } catch (error) {
    console.error("Unable to persist the checkout idempotency key:", error);
    return crypto.randomUUID();
  }
}

export function CheckoutPage() {
  const { user } = useAuth();
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const idempotencyKey = useRef(getOrderIdempotencyKey());

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const deliveryFee = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  function applyDiscount(code: string) {
    if (code.toUpperCase() !== DISCOUNT_CODE) {
      setDiscount(0);
      setDiscountCode("");
      return false;
    }

    setDiscountCode(DISCOUNT_CODE);
    setDiscount(Math.round(totalPrice * 0.1));
    return true;
  }

  async function placeOrder(
    customer: OrderCustomer,
    shippingAddress: ShippingAddress,
    paymentMethod: PaymentMethod,
  ) {
    setSubmitting(true);
    try {
      const created = await submitOrder({
        customer,
        shippingAddress,
        paymentMethod,
        items: items.map(({ product, quantity }) => ({
          productId: product._id,
          quantity,
        })),
        ...(discountCode ? { discountCode } : {}),
      }, idempotencyKey.current);

      const now = new Date(created.createdAt);
      const order: OrderConfirmation = {
        id: created._id,
        orderNumber: created.orderNumber,
        status: created.status,
        createdAt: now.toISOString(),
        customer: created.customer,
        shippingAddress: created.shippingAddress,
        paymentMethod: created.paymentMethod,
        items: created.items.map((item) => ({
          product: {
            _id: item.productId,
            name: item.name,
            description: "",
            price: item.price,
            stock: 0,
            category: item.category,
            image: item.image,
          },
          quantity: item.quantity,
        })),
        subtotal: created.subtotal,
        deliveryFee: created.deliveryFee,
        discount: created.discount,
        total: created.total,
        estimatedDelivery: getEstimatedDelivery(now),
      };

      try {
        sessionStorage.removeItem("atelier_order_idempotency_key");
      } catch (error) {
        console.error("Unable to clear the completed checkout idempotency key:", error);
      }
      clearCart();
      navigate("/order-success", { replace: true, state: { order } });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to place your order. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="premium-page min-h-screen overflow-hidden bg-[#f7faf8] text-stone-900 transition-colors dark:bg-[#0b1110] dark:text-stone-100">
      <div aria-hidden="true" className="gradient-orb gradient-orb-one" />
      <div aria-hidden="true" className="gradient-orb gradient-orb-two" />
      <Navbar />
      <motion.main
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto max-w-6xl px-5 pb-16 pt-3 sm:px-6"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-white" to="/cart">
            <ArrowLeft aria-hidden="true" size={16} />
            Back to cart
          </Link>
        </div>

        <StepIndicator current={2} />

        <header className="mx-auto mb-9 mt-10 max-w-2xl text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-900/15">
            <Leaf aria-hidden="true" size={22} />
          </span>
          <p className="eyebrow mt-5">ALMOST YOURS</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 dark:text-white sm:text-4xl">
            Complete your order
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-500 dark:text-stone-400">
            A few details and we’ll carefully prepare your {totalItems === 1 ? "item" : `${totalItems} items`}.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          <CheckoutForm
            defaultEmail={user?.email ?? ""}
            defaultName={user?.username ?? ""}
            onSubmit={placeOrder}
            submitting={submitting}
          />
          <div className="space-y-4 lg:sticky lg:top-6">
            <OrderSummary
              discount={discount}
              discountCode={discountCode}
              deliveryFee={deliveryFee}
              items={items}
              onApplyDiscount={applyDiscount}
              subtotal={totalPrice}
            />
            <AnimatePresence>
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 py-2 text-xs text-stone-500 dark:text-stone-400"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                transition={{ delay: 0.25 }}
              >
                <ShieldCheck aria-hidden="true" className="text-violet-600 dark:text-violet-300" size={16} />
                Your information is protected and kept private.
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
