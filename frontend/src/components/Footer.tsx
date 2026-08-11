import { Link } from "react-router-dom";
import { Droplet, HeartPulse } from "lucide-react";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "Login", to: "/login" },
  { label: "Register", to: "/register" },
];

const ROLE_LINKS = [
  { label: "For Donors", to: "/register/donor" },
  { label: "For Hospitals", to: "/register/hospital" },
];

export function Footer() {
  return (
    <footer id="about" className="border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-sm"
                aria-hidden
              >
                <Droplet className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Life<span className="text-primary">Link</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Connecting every drop to those in need. A smarter blood donation
              and emergency matching platform for donors, hospitals, and
              patients.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Join LifeLink
            </h3>
            <ul className="mt-4 space-y-3">
              {ROLE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            &copy; 2026 LifeLink. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <HeartPulse className="h-3.5 w-3.5 text-secondary" aria-hidden />
            Built for a DBMS project
          </p>
        </div>
      </div>
    </footer>
  );
}
