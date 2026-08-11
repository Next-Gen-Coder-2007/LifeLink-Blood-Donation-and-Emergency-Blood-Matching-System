import type { ReactNode } from "react";
import { HeartPulse, ShieldCheck, Timer, Users } from "lucide-react";
import { Logo } from "@/components/Logo";

const HIGHLIGHTS = [
  { icon: Timer, text: "Faster emergency blood matching" },
  { icon: Users, text: "A growing network of verified donors" },
  { icon: ShieldCheck, text: "Secure, hospital-grade platform" },
  { icon: HeartPulse, text: "Built to save lives, every second" },
];

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-secondary p-12 lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
        />

        <Logo to="/" variant="light" className="relative" />

        <div className="relative mt-auto">
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white">
            Every drop can save a life.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100">
            LifeLink connects blood donors, hospitals, and patients through a
            smarter and faster blood donation management system.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-blue-50">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <main className="flex flex-col">
        <div className="flex h-16 items-center px-6 lg:hidden">
          <Logo to="/" />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-2 text-sm text-muted">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
