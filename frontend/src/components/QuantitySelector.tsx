import { Minus, Plus } from "lucide-react";

type QuantitySelectorProps = {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
};

export function QuantitySelector({ value, min = 1, max, onChange }: QuantitySelectorProps) {
  return (
    <div className="inline-flex h-11 items-center rounded-xl border border-stone-200 bg-white">
      <button
        aria-label="Decrease quantity"
        className="grid h-10 w-10 place-items-center text-stone-600 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        type="button"
      >
        <Minus aria-hidden="true" size={15} />
      </button>
      <span aria-live="polite" className="min-w-8 text-center text-sm font-semibold text-stone-900">
        {value}
      </span>
      <button
        aria-label="Increase quantity"
        className="grid h-10 w-10 place-items-center text-stone-600 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        type="button"
      >
        <Plus aria-hidden="true" size={15} />
      </button>
    </div>
  );
}
