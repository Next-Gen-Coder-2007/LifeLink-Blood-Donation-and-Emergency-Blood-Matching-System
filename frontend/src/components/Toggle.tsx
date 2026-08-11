import { useId } from "react";
import { cn } from "@/lib/cn";

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, description, checked, onChange }: ToggleProps) {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white px-4 py-3.5 shadow-sm">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground" id={`${id}-label`}>
          {label}
        </span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          checked ? "bg-secondary" : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}
