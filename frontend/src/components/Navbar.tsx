import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplet, LogOut, LayoutDashboard, User } from "lucide-react";
import { getSession, clearSession } from "@/lib/api";
import { useAuthModal } from "@/context/AuthModalContext";

export function Navbar() {
  const navigate = useNavigate();
  const [session, setSessionState] = useState(getSession());
  const { openLogin, openRegister } = useAuthModal();

  useEffect(() => {
    const handleStorage = () => setSessionState(getSession());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const getDashboardPath = () => {
    if (!session) return "/";
    if (session.user.role === "hospital") return "/hospital/dashboard";
    if (session.user.role === "admin") return "/admin/dashboard";
    return "/donor/dashboard";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white shadow-xs">
            <Droplet className="h-4 w-4" />
          </div>
          <span className="text-lg tracking-tight">Life<span className="text-red-500">Link</span></span>
        </Link>

        <nav className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-2">
              <Link
                to={getDashboardPath()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition shadow-2xs"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-red-500" />
                Dashboard
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                <User className="h-3 w-3" />
                {session.user.name.split(" ")[0]} ({session.user.role})
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 transition"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openLogin}
                className="rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openRegister("donor")}
                className="rounded-xl bg-red-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition"
              >
                Get Started
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
