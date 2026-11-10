import { Check, Tag } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { CartItem } from "../context/cart-context";
import { formatPrice } from "../utils/formatPrice";

type OrderSummaryProps = {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  discountCode: string;
  onApplyDiscount: (code: string) => boolean;
};

export function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  discount,
  discountCode,
  onApplyDiscount,
}: OrderSummaryProps) {
  const [code, setCode] = useState(discountCode);
  const [codeMessage, setCodeMessage] = useState("");
  const reduceMotion = useReducedMotion();

  function applyCode() {
    const accepted = onApplyDiscount(code.trim());
    setCodeMessage(accepted ? "WELCOME10 applied: 10% off." : "That discount code isn’t valid.");
  }

  return (
    <motion.aside
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl p-5 sm:p-6"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      transition={{ duration: 0.45, delay: 0.12 }}
    >
      <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Your order</h2>
      <div className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
        {items.map(({ product, quantity }) => (
          <div className="flex gap-3" key={product._id}>
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-white/10">
              {product.image && <img alt={product.name} className="h-full w-full object-cover" src={product.image} />}
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-stone-900 px-1 text-[10px] font-bold text-white">
                {quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-stone-800 dark:text-stone-100">{product.name}</p>
              <p className="mt-1 text-xs text-stone-500">{formatPrice(product.price)} each</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-stone-800 dark:text-stone-100">
              {formatPrice(product.price * quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-stone-200 pt-5 dark:border-white/10">
        <label className="mb-2 block text-xs font-semibold text-stone-600 dark:text-stone-300" htmlFor="discount-code">
          Discount code
        </label>
        <div className="flex gap-2">
          <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-stone-200 bg-white/70 px-3 dark:border-white/10 dark:bg-stone-950/30">
            <Tag aria-hidden="true" className="shrink-0 text-stone-400" size={16} />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
              id="discount-code"
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter code"
              value={code}
            />
          </div>
          <button
            className="rounded-xl border border-stone-200 px-3 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-white/10 dark:text-stone-200 dark:hover:bg-white/10"
            onClick={applyCode}
            type="button"
          >
            Apply
          </button>
        </div>
        {codeMessage && (
          <p className={`mt-2 flex items-center gap-1 text-xs ${discount > 0 ? "text-violet-600 dark:text-violet-300" : "text-red-500"}`}>
            {discount > 0 && <Check aria-hidden="true" size={13} />}
            {codeMessage}
          </p>
        )}
      </div>

      <dl className="mt-5 space-y-3 border-t border-stone-200 pt-5 text-sm dark:border-white/10">
        <div className="flex justify-between text-stone-500 dark:text-stone-400">
          <dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-stone-500 dark:text-stone-400">
          <dt>Delivery</dt><dd>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-violet-600 dark:text-violet-300">
            <dt>Discount</dt><dd>−{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-stone-200 pt-4 text-base font-bold text-stone-950 dark:border-white/10 dark:text-white">
          <dt>Total</dt><dd>{formatPrice(Math.max(0, subtotal + deliveryFee - discount))}</dd>
        </div>
      </dl>
    </motion.aside>
  );
}
