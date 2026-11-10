import { motion, useReducedMotion } from "framer-motion";

type ThankYouNoteProps = {
  name: string;
  email: string;
  orderNumber: string;
};

export function ThankYouNote({ name, email, orderNumber }: ThankYouNoteProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-7 max-w-2xl text-center"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <p className="eyebrow">ORDER CONFIRMED</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 dark:text-white sm:text-4xl">
        Thank you for your order, {name}! <span aria-hidden="true">🎉</span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-600 dark:text-stone-300 sm:text-base">
        We truly appreciate your trust in us. Your order <strong className="text-stone-900 dark:text-white">#{orderNumber}</strong> has been placed successfully and we’re already preparing it with care.
      </p>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        A confirmation has been sent to <span className="font-medium text-stone-700 dark:text-stone-200">{email}</span>.
      </p>
    </motion.section>
  );
}
