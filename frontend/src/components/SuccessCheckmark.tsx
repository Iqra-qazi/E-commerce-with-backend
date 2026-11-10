import { motion, useReducedMotion } from "framer-motion";

export function SuccessCheckmark() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={reduceMotion ? { scale: 1 } : { scale: [0.85, 1.06, 1] }}
      aria-label="Order placed successfully"
      className="relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 shadow-xl shadow-violet-500/25"
      initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
      role="img"
      transition={{ duration: 0.65, ease: "backOut" }}
    >
      <motion.span
        animate={reduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.35, 0.12, 0.35] }}
        className="absolute inset-0 -z-10 rounded-full bg-violet-400"
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg aria-hidden="true" className="h-12 w-12" fill="none" viewBox="0 0 48 48">
        <motion.path
          animate={{ pathLength: 1, opacity: 1 }}
          d="m12 25 8 8 17-18"
          initial={{ pathLength: 0, opacity: 0 }}
          stroke="white"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
}
