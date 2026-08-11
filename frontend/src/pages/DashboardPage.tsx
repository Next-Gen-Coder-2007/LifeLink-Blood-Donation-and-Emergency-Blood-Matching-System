import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Droplet,
  LogOut,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";

export function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Safely parse user session directly from localStorage
  const getSession = () => {
    try {
      const stored = localStorage.getItem("user") || localStorage.getItem("lifelink_session");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const session = getSession();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("lifelink_session");
    showToast("You have been logged out.", "info");
    navigate("/login", { replace: true });
  };

  // Safe fallbacks for user details regardless of FastAPI response shape
  const userName = session?.user?.name || session?.name || "User";
  const userEmail = session?.user?.email || session?.email || "user@lifelink.com";
  const userRole = session?.user?.role || session?.role || "donor";

  const initials = userName
    .split(" ")
    .map((part: string) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleLabel =
    userRole.toLowerCase() === "hospital" ? "Hospital" : "Donor";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo to="/" />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-line bg-white p-8 shadow-card sm:p-12">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-xl font-bold text-white shadow-sm">
              {initials || "LL"}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Welcome back, {userName}!
              </h1>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-muted">
                <ShieldCheck className="h-4 w-4 text-secondary" aria-hidden />
                Signed in as {userEmail} &middot; {roleLabel}
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-emerald-50 p-5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            <div>
              <p className="font-semibold text-emerald-800">
                You are successfully logged in.
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                Your FastAPI session is active and connected to the dashboard.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-background p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Droplet className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-medium text-muted">Profile</p>
                <p className="text-sm font-semibold text-foreground">
                  {roleLabel} account
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-background p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <MapPin className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-medium text-muted">Location</p>
                <p className="text-sm font-semibold text-foreground">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-background p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-soft text-secondary">
                <Building2 className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-medium text-muted">Network</p>
                <p className="text-sm font-semibold text-foreground">Connected</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row">
            <Button asChild>
              <Link to="/">
                <Droplet className="h-4 w-4" aria-hidden />
                Explore LifeLink
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">
                <Phone className="h-4 w-4" aria-hidden />
                Request Blood
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}