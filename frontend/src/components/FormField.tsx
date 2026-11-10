import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  suffix?: React.ReactNode;
};

export function FormField({ label, error, id, suffix, ...inputProps }: FormFieldProps) {
  const inputId = id ?? inputProps.name;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor={inputId}>
        {label}
      </label>
      <div className={`input-shell flex h-12 items-center rounded-xl border bg-white px-3.5 ${error ? "border-red-300" : "border-stone-200"}`}>
        <input
          {...inputProps}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
        />
        {suffix}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600" id={errorId}>{error}</p>}
    </div>
  );
}
