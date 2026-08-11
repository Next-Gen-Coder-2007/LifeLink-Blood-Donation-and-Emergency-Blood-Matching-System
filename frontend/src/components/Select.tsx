import { useId, type SelectHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Select({ label, error, hint, className, id, children, ...props }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const errorId = `${selectId}-error`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border bg-white px-3.5 pr-10 text-sm text-foreground shadow-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            error
              ? "border-red-300 focus:border-red-400"
              : "border-line hover:border-slate-300 focus:border-primary",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
