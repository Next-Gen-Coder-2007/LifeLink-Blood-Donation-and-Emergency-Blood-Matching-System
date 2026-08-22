import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Droplet,
  LogOut,
  LayoutDashboard,
  Bell,
  Compass,
  Building2,
  Heart,
  Shield,
  Settings,
} from "lucide-react";
import { getSession, clearSession, api } from "@/lib/api";
import { useAuthModal } from "@/context/AuthModalContext";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSessionState] = useState(getSession());
  const [unreadCount, setUnreadCount] = useState(0);
  const { openLogin, openRegister } = useAuthModal();

  // Sync session state on navigation and storage events
  useEffect(() => {
    const syncSession = () => {
      const current = getSession();
      setSessionState(current);
    };

    syncSession();
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, [location.pathname]);

  // Notifications polling for authenticated users
  useEffect(() => {
    if (!session || !session.user || !session.user.id) {
      setUnreadCount(0);
      return;
    }

    const checkNotifications = async () => {
      try {
        const res = await api.get<{ unread_count: number }>(
          `/notifications/user/${session.user.id}?role=${session.user.role}`
        );
        setUnreadCount(res.unread_count || 0);
      } catch {
        // Silent catch
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 15000);
    return () => clearInterval(interval);
  }, [session]);

  const handleLogout = () => {
    clearSession();
    setSessionState(null);
    navigate("/");
  };

  const getDashboardPath = () => {
    if (!session) return "/";
    if (session.user.role === "hospital") return "/hospital/dashboard";
    if (session.user.role === "admin") return "/admin/dashboard";
    return "/donor/dashboard";
  };

  const isHomePage = location.pathname === "/";
  const isUserAuthenticated = Boolean(session && session.user && session.user.id);
  const role = session?.user.role;

  // On Home Page: ONLY show Logo on left and Login + Register on right
  if (isHomePage) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-white shadow-xs group-hover:bg-red-600 transition">
              <Droplet className="h-4.5 w-4.5 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tight">
              Life<span className="text-red-500">Link</span>
            </span>
          </Link>

          {/* Home Page Right Action: ONLY Login & Register */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={openLogin}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => openRegister("donor")}
              className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition cursor-pointer"
            >
              Register
            </button>
          </div>
        </div>
      </header>
    );
  }

  // On App / Dashboard / Portal Pages: Show Portal Header
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Logo */}
        <Link to={getDashboardPath()} className="flex items-center gap-2 font-bold text-slate-900 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-white shadow-xs group-hover:bg-red-600 transition">
            <Droplet className="h-4.5 w-4.5 fill-current" />
          </div>
          <span className="text-xl font-black tracking-tight">
            Life<span className="text-red-500">Link</span>
          </span>
        </Link>

        {/* Center: Portal Links */}
        <nav className="hidden sm:flex items-center gap-1.5">
          <Link
            to={getDashboardPath()}
            className="flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-red-500" />
            Dashboard
          </Link>
          <Link
            to="/hospital/map"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Compass className="h-3.5 w-3.5 text-blue-600" />
            Live Map Radar
          </Link>
        </nav>

        {/* Right: Auth & User Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {isUserAuthenticated && session ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Notification Bell */}
              <Link
                to="/donor/notifications"
                className="relative rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Settings / Profile Button */}
              <Link
                to={role === "hospital" ? "/hospital/settings" : "/donor/profile"}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                title="Account & Facility Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>

              {/* User Pill with Role Indicator */}
              <Link
                to={role === "hospital" ? "/hospital/settings" : "/donor/profile"}
                className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                {role === "hospital" && <Building2 className="h-3.5 w-3.5 text-blue-600" />}
                {role === "donor" && <Heart className="h-3.5 w-3.5 text-red-500" />}
                {role === "admin" && <Shield className="h-3.5 w-3.5 text-purple-600" />}
                <span className="font-bold text-slate-900 truncate max-w-[120px]">
                  {(session.user.name || "User").split(" ")[0]}
                </span>
                <span className="text-slate-400">•</span>
                <span className="capitalize text-slate-500 text-[11px]">{role}</span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-red-600 hover:border-red-200 transition cursor-pointer"
                title="Sign Out"
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
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => openRegister("donor")}
                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
