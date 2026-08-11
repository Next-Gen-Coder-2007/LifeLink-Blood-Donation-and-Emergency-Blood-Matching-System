import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, error, hint, icon, className, id, ...props }, ref) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const errorId = `${inputId}-error`;
    const [visible, setVisible] = useState(false);

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
            type={visible ? "text" : "password"}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "h-11 w-full rounded-xl border bg-white py-2.5 text-sm text-foreground shadow-sm transition-colors",
              "placeholder:text-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-primary/30",
              "pr-11",
              icon ? "pl-10" : "pl-3.5",
              error
                ? "border-red-300 focus:border-red-400"
                : "border-line hover:border-slate-300 focus:border-primary",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
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
  },
);
