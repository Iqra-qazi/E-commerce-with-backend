import { CreditCard } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function CardPreview({ cardholder }: { cardholder: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
      className="relative isolate min-h-48 overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 p-5 text-white shadow-xl shadow-violet-900/15"
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="absolute -right-10 -top-20 -z-10 h-48 w-48 rounded-full border border-white/20" />
      <span className="absolute -bottom-28 right-10 -z-10 h-56 w-56 rounded-full border border-white/20" />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Atelier card preview</span>
        <CreditCard aria-hidden="true" size={24} />
      </div>
      <p className="mt-8 font-mono text-lg tracking-[0.16em]">•••• •••• •••• 4242</p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.18em] text-white/65">Cardholder</p>
          <p className="mt-1 truncate text-sm font-medium uppercase">{cardholder || "YOUR NAME"}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-[0.18em] text-white/65">Payment</p>
          <p className="mt-1 text-xs font-semibold">Not processed here</p>
        </div>
      </div>
    </motion.div>
  );
}
