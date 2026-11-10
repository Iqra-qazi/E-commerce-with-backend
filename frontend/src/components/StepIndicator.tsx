import { motion, useReducedMotion } from "framer-motion";

const steps = ["Cart", "Details", "Payment", "Done"];

export function StepIndicator({ current = 1 }: { current: number }) {
  const reduceMotion = useReducedMotion();
  const progress = ((current - 1) / (steps.length - 1)) * 100;

  return (
    <nav aria-label="Checkout progress" className="mx-auto w-full max-w-3xl">
      <div className="relative flex justify-between">
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-stone-200 dark:bg-white/15" />
        <motion.div
          animate={{ width: `${progress}%` }}
          className="absolute left-0 top-4 h-0.5 bg-gradient-to-r from-violet-500 to-pink-400"
          initial={false}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.55, ease: "easeOut" }}
        />
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const active = stepNumber <= current;
          return (
            <div className="relative flex flex-col items-center gap-2" key={step}>
              <span
                aria-current={stepNumber === current ? "step" : undefined}
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition ${
                  active
                    ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-md shadow-violet-500/25"
                    : "border border-stone-200 bg-white text-stone-400 dark:border-white/15 dark:bg-stone-900"
                }`}
              >
                {stepNumber}
              </span>
              <span className={`text-xs font-medium ${active ? "text-stone-800 dark:text-stone-100" : "text-stone-400"}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
