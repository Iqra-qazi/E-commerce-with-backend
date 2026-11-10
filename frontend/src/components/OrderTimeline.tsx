import { Check, Package, PackageCheck, Truck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const stages = [
  { title: "Order placed", description: "We received your order.", icon: Check },
  { title: "Packed", description: "Being prepared with care.", icon: Package },
  { title: "Shipped", description: "On its way to you.", icon: Truck },
  { title: "Delivered", description: "Enjoy your new find.", icon: PackageCheck },
];

export function OrderTimeline({ orderDate }: { orderDate: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-labelledby="order-tracking-heading" className="glass-panel rounded-3xl p-5 sm:p-7" id="order-tracking">
      <p className="eyebrow">WHAT HAPPENS NEXT</p>
      <h2 className="mt-2 text-xl font-semibold text-stone-900 dark:text-white" id="order-tracking-heading">Order progress</h2>
      <ol className="mt-6 grid gap-5 sm:grid-cols-4 sm:gap-3">
        {stages.map(({ title, description, icon: Icon }, index) => (
          <motion.li
            animate={{ opacity: 1, y: 0 }}
            className="relative flex items-start gap-3 sm:flex-col"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            key={title}
            transition={{ duration: 0.4, delay: 0.12 + index * 0.1 }}
          >
            {index < stages.length - 1 && (
              <span aria-hidden="true" className="absolute bottom-[-18px] left-4 top-9 w-px bg-stone-200 sm:left-9 sm:right-[-12px] sm:top-4 sm:h-px sm:w-auto dark:bg-white/10" />
            )}
            <span className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
              index === 0
                ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-md shadow-violet-500/20"
                : "border border-stone-200 bg-white text-stone-400 dark:border-white/10 dark:bg-stone-900"
            }`}>
              <Icon aria-hidden="true" size={16} />
            </span>
            <span>
              <span className={`block text-sm font-semibold ${index === 0 ? "text-stone-900 dark:text-white" : "text-stone-500 dark:text-stone-400"}`}>
                {title}
              </span>
              <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">
                {index === 0 ? new Date(orderDate).toLocaleDateString("en-PK") : description}
              </span>
            </span>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
