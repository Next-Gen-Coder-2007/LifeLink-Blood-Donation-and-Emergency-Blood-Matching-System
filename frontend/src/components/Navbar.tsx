import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Donors", href: "#for-donors" },
  { label: "For Hospitals", href: "#for-hospitals" },
  { label: "Features", href: "#features" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-white">

      {/* ================================
          MAIN NAVBAR
      ================================= */}

      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}

        <div className="shrink-0">
          <Logo to="/" />
        </div>

        {/* ================================
            DESKTOP NAVIGATION
        ================================= */}

        <div className="hidden items-center gap-1 md:flex">

          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-slate-100 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}

        </div>

        {/* ================================
            ACTION BUTTONS
        ================================= */}

        <div className="flex items-center gap-2">

          <Button
            asChild
            variant="ghost"
            size="sm"
          >
            <Link to="/login">
              Login
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
          >
            <Link to="/register">
              Get Started
            </Link>
          </Button>

        </div>

      </nav>

      {/* ================================
          MOBILE NAVIGATION
          Horizontal only
          NO SIDEBAR
          NO HAMBURGER
          NO DRAWER
      ================================= */}

      <div className="border-t border-line/60 md:hidden">

        <div className="flex w-full gap-1 overflow-x-auto px-4 py-2">

          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-slate-100 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}

        </div>

      </div>

    </header>
  );
}