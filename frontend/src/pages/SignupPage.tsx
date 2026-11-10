import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "../components/AuthLayout";
import { FormField } from "../components/FormField";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/errors";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(60, "Name must be 60 characters or fewer."),
  email: z.string().trim().min(1, "Enter your email address.").email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters for your password."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
}).refine((values) => values.password === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupPage() {
  const { register } = useAuth();
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupValues) {
    try {
      await register(values.name, values.email, values.password);
      toast.success("Your account is ready.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create your account. Please try again."));
    }
  }

  return (
    <AuthLayout
      title="Make yourself at home"
      description="Create an account for a more personal way to shop the things you love."
      footer={
        <p className="text-center text-sm text-stone-500">
          Already have an account? <Link className="font-semibold text-[#a95637] hover:text-[#81402a]" to="/login">Sign in</Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          error={errors.name?.message}
          {...registerField("name")}
        />
        <FormField
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...registerField("email")}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...registerField("password")}
        />
        <FormField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Enter your password again"
          error={errors.confirmPassword?.message}
          {...registerField("confirmPassword")}
        />
        <button
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:cursor-not-allowed disabled:opacity-65"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting && <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />}
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
        <p className="pt-1 text-center text-xs leading-5 text-stone-400">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  );
}
