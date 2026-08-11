import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export interface LoadingButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  fullWidth?: boolean;
}

const VARIANTS = {
  primary:
    "bg-primary text-white hover:bg-primary-dark focus-visible:outline-primary",
  secondary:
    "bg-secondary text-white hover:bg-secondary-dark focus-visible:outline-secondary",
  outline:
    "border border-line bg-white text-foreground hover:bg-primary-soft focus-visible:outline-primary",
  ghost: "text-foreground hover:bg-slate-100 focus-visible:outline-primary",
};

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  function LoadingButton(
    {
      loading = false,
      loadingText,
      variant = "primary",
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={cn(
          "inline-flex h-12 select-none items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold",
          "shadow-sm transition-all duration-150",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60",
          VARIANTS[variant],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {loading ? (loadingText ?? children) : children}
      </button>
    );
  },
);
