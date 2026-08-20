import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

interface StatCardProps {
  icon: LucideIcon;
  iconColor?: string;
  value: string | number;
  label: string;
  to?: string;
  className?: string;
}

export function StatCard({ icon: Icon, iconColor = "text-slate-900", value, label, to, className }: StatCardProps) {
  const content = (
    <div className={cn("rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300", className)}>
      <Icon className={cn("h-5 w-5", iconColor)} />
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
}
