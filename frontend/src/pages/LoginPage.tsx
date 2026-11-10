import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/errors";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    try {
      await login(values.email, values.password);
      toast.success("Welcome back.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sign in. Please try again."));
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to pick up right where you left off."
      footer={
        <p className="text-center text-sm text-stone-500">
          New around here? <Link className="font-semibold text-[#a95637] hover:text-[#81402a]" to="/signup">Create an account</Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="ml-2 rounded-md p-1 text-stone-400 transition hover:text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a95637]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          {...register("password")}
        />
        <button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:cursor-not-allowed disabled:opacity-65"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting && <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
