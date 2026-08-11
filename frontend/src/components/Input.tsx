import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-foreground shadow-sm transition-colors",
            "placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            icon && "pl-10",
            error
              ? "border-red-300 focus:border-red-400"
              : "border-line hover:border-slate-300 focus:border-primary",
            className,
          )}
          {...props}
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
});
