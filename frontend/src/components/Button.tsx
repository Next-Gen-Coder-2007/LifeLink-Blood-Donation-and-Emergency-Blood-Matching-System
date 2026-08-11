import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-dark focus-visible:outline-primary",
  secondary:
    "bg-secondary text-white shadow-sm hover:bg-secondary-dark focus-visible:outline-secondary",
  outline:
    "border border-line bg-white text-foreground hover:border-primary/40 hover:bg-primary-soft focus-visible:outline-primary",
  ghost: "text-foreground hover:bg-slate-100 focus-visible:outline-primary",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

function renderChildren({
  asChild,
  children,
  className,
  disabled,
  loading,
  rest,
}: {
  asChild: boolean;
  children: React.ReactNode;
  className: string;
  disabled?: boolean;
  loading?: boolean;
  rest: Record<string, unknown>;
}) {
  if (!asChild) return children;

  if (!isValidElement(children)) {
    throw new Error("Button asChild expects a single React element child.");
  }

  const child = children as ReactElement<Record<string, unknown>>;

  return cloneElement(child, {
    ...rest,
    className: cn(className, (child.props.className as string) || undefined),
    "aria-disabled": disabled || loading ? true : undefined,
    tabIndex: disabled || loading ? -1 : undefined,
  } as Record<string, unknown>);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    asChild = false,
    className,
    disabled,
    children,
    ...props
  },
  ref,
) {
  const classes = cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && "w-full",
    className,
  );

  if (asChild) {
    return (
      <span className={cn("inline-flex", fullWidth && "w-full")}>
        {renderChildren({
          asChild,
          children,
          className: classes,
          disabled,
          loading,
          rest: { ...props },
        })}
      </span>
    );
  }

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
