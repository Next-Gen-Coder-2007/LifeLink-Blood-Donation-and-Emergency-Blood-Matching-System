import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

interface RegistrationLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function RegistrationLayout({ title, subtitle, children }: RegistrationLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line/70 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo to="/" />
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All roles
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {subtitle}
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
