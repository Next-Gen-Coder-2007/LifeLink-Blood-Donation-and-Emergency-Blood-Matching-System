import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FormSectionProps {
  step?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ step, title, description, children, className }: FormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8",
        className,
      )}
    >
      <header className="mb-6">
        <div className="flex items-center gap-3">
          {step && (
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xs font-bold text-primary"
            >
              {step}
            </span>
          )}
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </header>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}
