import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "For Donors", to: "/#for-donors" },
  { label: "For Hospitals", to: "/#for-hospitals" },
  { label: "About", to: "/#about" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = (to: string) => {
    setOpen(false);
    if (to.startsWith("/#")) {
      const hash = to.slice(1);
      if (location.pathname === "/") {
        const target = document.getElementById(hash);
        target?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = to;
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo to="/" />

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={() => handleNavClick(link.to)}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-slate-100 hover:text-foreground",
                  isActive && link.to === "/" && "text-primary",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/register">Get Started</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-line bg-white lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  onClick={() => handleNavClick(link.to)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-slate-100"
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
                <Button asChild variant="outline" fullWidth onClick={() => setOpen(false)}>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild fullWidth onClick={() => setOpen(false)}>
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
