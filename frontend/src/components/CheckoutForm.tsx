import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Banknote, CreditCard, LoaderCircle, Smartphone } from "lucide-react";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { OrderCustomer, PaymentMethod, ShippingAddress } from "../types/order";
import { CardPreview } from "./CardPreview";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(20, "Phone number is too long."),
  addressLine1: z.string().trim().min(5, "Enter your street address."),
  addressLine2: z.string(),
  city: z.string().trim().min(2, "Enter your city."),
  province: z.string().trim().min(2, "Enter your province or region."),
  postalCode: z.string().trim().min(3, "Enter a valid postal code."),
  paymentMethod: z.enum(["card", "cod", "jazzcash", "easypaisa"]),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type CheckoutFormProps = {
  defaultName: string;
  defaultEmail: string;
  submitting: boolean;
  onSubmit: (customer: OrderCustomer, address: ShippingAddress, paymentMethod: PaymentMethod) => Promise<void>;
};

const paymentOptions: Array<{
  value: PaymentMethod;
  title: string;
  description: string;
  icon: typeof CreditCard;
}> = [
  { value: "card", title: "Card", description: "Preview only; no card details are collected", icon: CreditCard },
  { value: "cod", title: "Cash on Delivery", description: "Pay when your order arrives", icon: Banknote },
  { value: "jazzcash", title: "JazzCash", description: "Mobile wallet payment selection", icon: Smartphone },
  { value: "easypaisa", title: "Easypaisa", description: "Mobile wallet payment selection", icon: Smartphone },
];

function FieldError({ message }: { message?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          animate={{ opacity: 1, x: reduceMotion ? 0 : [0, -5, 5, -4, 4, 0], height: "auto" }}
          className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
          exit={{ opacity: 0, height: 0 }}
          initial={reduceMotion ? false : { opacity: 0, x: -8, height: 0 }}
          key={message}
          role="alert"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function CheckoutForm({ defaultName, defaultEmail, submitting, onSubmit }: CheckoutFormProps) {
  const reduceMotion = useReducedMotion();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      province: "",
      postalCode: "",
      paymentMethod: "cod",
    },
  });
  const cardholder = watch("name");
  const paymentMethod = watch("paymentMethod");

  function onInvalid(formErrors: FieldErrors<CheckoutFormValues>) {
    console.error("Checkout validation failed:", formErrors);
    toast.error("Please review the highlighted checkout details.");
  }

  function submit(values: CheckoutFormValues) {
    return onSubmit(
      { name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim() },
      {
        line1: values.addressLine1.trim(),
        line2: values.addressLine2.trim(),
        city: values.city.trim(),
        province: values.province.trim(),
        postalCode: values.postalCode.trim(),
        country: "Pakistan",
      },
      values.paymentMethod,
    );
  }

  const fieldClass =
    "mt-2 h-11 w-full rounded-xl border border-stone-200 bg-white/80 px-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-stone-950/30 dark:text-white dark:placeholder:text-stone-500";

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(submit, onInvalid)}>
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-5 sm:p-7"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        transition={{ duration: 0.4 }}
      >
        <p className="eyebrow">01 · YOUR DETAILS</p>
        <h2 className="mt-2 text-xl font-semibold text-stone-900 dark:text-white">Contact information</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-200">
            Full name
            <input autoComplete="name" className={fieldClass} {...register("name")} />
            <FieldError message={errors.name?.message} />
          </label>
          <label className="text-sm font-medium text-stone-700 dark:text-stone-200">
            Email address
            <input autoComplete="email" className={fieldClass} type="email" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </label>
          <label className="text-sm font-medium text-stone-700 dark:text-stone-200 sm:col-span-2">
            Phone number
            <input autoComplete="tel" className={fieldClass} placeholder="+92 300 1234567" type="tel" {...register("phone")} />
            <FieldError message={errors.phone?.message} />
          </label>
        </div>
      </motion.section>

      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-5 sm:p-7"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <p className="eyebrow">02 · WHERE TO?</p>
        <h2 className="mt-2 text-xl font-semibold text-stone-900 dark:text-white">Shipping address</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-200 sm:col-span-2">
            Street address
            <input autoComplete="address-line1" className={fieldClass} {...register("addressLine1")} />
            <FieldError message={errors.addressLine1?.message} />
          </label>
          <label className="text-sm font-medium text-stone-700 dark:text-stone-200 sm:col-span-2">
            Apartment, suite, etc. <span className="font-normal text-stone-400">(optional)</span>
            <input autoComplete="address-line2" className={fieldClass} {...register("addressLine2")} />
          </label>
          <label className="text-sm font-medium text-stone-700 dark:text-stone-200">
            City
            <input autoComplete="address-level2" className={fieldClass} {...register("city")} />
            <FieldError message={errors.city?.message} />
          </label>
          <label className="text-sm font-medium text-stone-700 dark:text-stone-200">
            Province / region
            <input autoComplete="address-level1" className={fieldClass} {...register("province")} />
            <FieldError message={errors.province?.message} />
          </label>
          <label className="text-sm font-medium text-stone-700 dark:text-stone-200">
            Postal code
            <input autoComplete="postal-code" className={fieldClass} {...register("postalCode")} />
            <FieldError message={errors.postalCode?.message} />
          </label>
          <label className="text-sm font-medium text-stone-700 dark:text-stone-200">
            Country
            <input className={`${fieldClass} cursor-not-allowed`} readOnly value="Pakistan" />
          </label>
        </div>
      </motion.section>

      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-5 sm:p-7"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        transition={{ duration: 0.4, delay: 0.16 }}
      >
        <p className="eyebrow">03 · PAYMENT</p>
        <h2 className="mt-2 text-xl font-semibold text-stone-900 dark:text-white">Choose a payment method</h2>
        <fieldset className="mt-5 space-y-3">
          <legend className="sr-only">Payment method</legend>
          {paymentOptions.map(({ value, title, description, icon: Icon }) => (
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition focus-within:ring-4 focus-within:ring-violet-500/10 ${
                paymentMethod === value
                  ? "border-violet-500 bg-violet-50/70 dark:bg-violet-500/10"
                  : "border-stone-200 bg-white/50 hover:border-stone-300 dark:border-white/10 dark:bg-stone-950/20 dark:hover:border-white/20"
              }`}
              key={value}
            >
              <input className="sr-only" type="radio" value={value} {...register("paymentMethod")} />
              <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-violet-700 dark:text-violet-300" size={19} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-stone-900 dark:text-white">{title}</span>
                <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">{description}</span>
              </span>
              <span
                aria-hidden="true"
                className={`mt-1 h-4 w-4 rounded-full border ${
                  paymentMethod === value ? "border-[5px] border-violet-600" : "border-stone-300 dark:border-stone-500"
                }`}
              />
            </label>
          ))}
        </fieldset>

        <AnimatePresence initial={false}>
          {paymentMethod === "card" && (
            <motion.div
              animate={{ opacity: 1, height: "auto", marginTop: 20 }}
              className="overflow-hidden"
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              initial={reduceMotion ? false : { opacity: 0, height: 0, marginTop: 0 }}
            >
              <CardPreview cardholder={cardholder} />
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
                This is a visual preview only. Card details are not requested or processed. Confirm card payments are supported by your order service before enabling this option.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <motion.button
        className="motion-button inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-6 text-sm font-bold text-white shadow-lg shadow-violet-900/15 transition hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:opacity-65"
        disabled={submitting}
        whileHover={reduceMotion || submitting ? undefined : { scale: 1.015 }}
        whileTap={reduceMotion || submitting ? undefined : { scale: 0.985 }}
        type="submit"
      >
        {submitting ? (
          <><LoaderCircle aria-hidden="true" className="animate-spin" size={18} /> Placing your order…</>
        ) : (
          <>Place order securely</>
        )}
      </motion.button>
      <p className="text-center text-xs text-stone-500 dark:text-stone-400">
        Your order details are sent securely to the store. No card details are collected on this page.
      </p>
    </form>
  );
}
