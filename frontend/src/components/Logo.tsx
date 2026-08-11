import { Link } from "react-router-dom";
import { Droplet } from "lucide-react";
import { cn } from "@/lib/cn";

interface LogoProps {
  to?: string;
  variant?: "light" | "dark";
  className?: string;
}

export function Logo({ to = "/", variant = "dark", className }: LogoProps) {
  const iconClass =
    variant === "light"
      ? "bg-white/15 text-white"
      : "bg-gradient-to-br from-primary to-secondary text-white";

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl shadow-sm",
          iconClass,
        )}
        aria-hidden
      >
        <Droplet className="h-5 w-5" />
      </span>
      <span
        className={cn(
          "text-xl font-bold tracking-tight",
          variant === "light" ? "text-white" : "text-foreground",
        )}
      >
        Life<span className="text-primary">Link</span>
      </span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} aria-label="LifeLink home" className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
