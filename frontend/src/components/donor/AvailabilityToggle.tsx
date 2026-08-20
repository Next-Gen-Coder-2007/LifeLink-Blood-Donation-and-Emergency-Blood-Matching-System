import { cn } from "@/lib/cn";

interface AvailabilityToggleProps {
  available: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function AvailabilityToggle({ available, onToggle, disabled }: AvailabilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs disabled:opacity-50",
        available
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          available ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
        )}
      />
      {available ? "Available for Donations" : "Marked Unavailable"}
    </button>
  );
}
