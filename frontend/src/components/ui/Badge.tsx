import { cn } from "@/lib/cn";

export function BloodGroupBadge({ group, className }: { group: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-bold text-red-700",
        className
      )}
    >
      {group}
    </span>
  );
}

export function UrgencyBadge({ urgency, className }: { urgency: "normal" | "urgent" | "emergency" | string; className?: string }) {
  const styles = {
    emergency: "bg-red-100 text-red-700 border-red-200",
    urgent: "bg-amber-100 text-amber-700 border-amber-200",
    normal: "bg-blue-100 text-blue-700 border-blue-200",
  }[urgency] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
        styles,
        className
      )}
    >
      {urgency}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const isSearching = status === "searching";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold capitalize",
        isSearching
          ? "bg-amber-50 text-amber-700 border border-amber-200"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200",
        className
      )}
    >
      {status}
    </span>
  );
}
