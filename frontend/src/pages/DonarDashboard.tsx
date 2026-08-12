import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Droplet,
  HeartPulse,
  History,
  LogOut,
  MapPin,
  Menu,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";

const API_BASE_URL = "http://127.0.0.1:8000";

// ============================================================
// TYPES
// ============================================================

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Session {
  user?: SessionUser;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface Donor {
  id: string;
  user_id: string;
  blood_group: string;
  phone: string;
  latitude: number;
  longitude: number;
  availability: boolean;
  last_donation_date?: string | null;
}

// ============================================================
// COMPONENT
// ============================================================

export function DonorDashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ==========================================================
  // SESSION
  // ==========================================================

  const getSession = (): Session | null => {
    try {
      const stored =
        localStorage.getItem("user") ||
        localStorage.getItem("lifelink_session");

      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const session = getSession();

  const sessionUser = session?.user;

  const userId =
    sessionUser?.id ||
    session?.id ||
    "";

  const userName =
    sessionUser?.name ||
    session?.name ||
    "User";

  const userEmail =
    sessionUser?.email ||
    session?.email ||
    "";

  // ==========================================================
  // DONOR DATA
  // ==========================================================

  const [donor, setDonor] = useState<Donor | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // FETCH DONOR DATA
  // ==========================================================

  const fetchDonorData = async () => {
    if (!userId) {
      setError("User session not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/donors`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch donors: ${response.status}`
        );
      }

      const donors: Donor[] = await response.json();

      // Find donor belonging to logged-in user
      const currentDonor = donors.find(
        (item) => String(item.user_id) === String(userId)
      );

      if (!currentDonor) {
        throw new Error(
          "Donor profile was not found."
        );
      }

      setDonor(currentDonor);
    } catch (err) {
      console.error("Donor dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load donor information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, [userId]);

  // ==========================================================
  // DONOR VALUES
  // ==========================================================

  const bloodGroup =
    donor?.blood_group || "--";

  const availability =
    donor?.availability ?? false;

  const lastDonation =
    donor?.last_donation_date || null;

  // ==========================================================
  // INITIALS
  // ==========================================================

  const initials = userName
    .split(" ")
    .map((part: string) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("lifelink_session");

    showToast(
      "You have been logged out.",
      "info"
    );

    navigate("/login", {
      replace: true,
    });
  };

  // ==========================================================
  // RESPOND
  // ==========================================================

  const handleRespond = () => {
    showToast(
      "Your response has been sent to the hospital.",
      "success"
    );
  };

  // ==========================================================
  // DATE FORMAT
  // ==========================================================

  const formatDate = (
    value: string | null | undefined
  ) => {
    if (!value) {
      return "No donation recorded";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-line border-t-primary" />

          <p className="mt-4 text-sm text-muted">
            Loading your donor dashboard...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <div className="min-h-screen bg-background">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 h-16 border-b border-line bg-white">

        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">

          <Logo to="/dashboard" />

          <div className="flex items-center gap-4">

            <div className="hidden items-center gap-3 sm:flex">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                {initials || "LL"}
              </div>

              <div>

                <p className="text-sm font-semibold text-foreground">
                  {userName}
                </p>

                <p className="text-xs text-muted">
                  Donor
                </p>

              </div>

            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />

              <span className="hidden sm:inline">
                Logout
              </span>
            </Button>

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  !mobileMenuOpen
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-line lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

          </div>

        </div>

      </header>

      {/* ======================================================
          MOBILE NAVIGATION
      ====================================================== */}

      {mobileMenuOpen && (
        <div className="border-b border-line bg-white px-4 py-4 lg:hidden">

          <nav className="space-y-1">

            <Link
              to="/dashboard"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="flex items-center gap-3 rounded-xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary"
            >
              <HeartPulse className="h-5 w-5" />
              Dashboard
            </Link>

            <Link
              to="/donor/profile"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-background hover:text-foreground"
            >
              <UserRound className="h-5 w-5" />
              My Profile
            </Link>

            <Link
              to="/donor/requests"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-background hover:text-foreground"
            >
              <Droplet className="h-5 w-5" />
              Blood Requests
            </Link>

            <Link
              to="/donor/notifications"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-background hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              Notifications
            </Link>

            <Link
              to="/donor/history"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-background hover:text-foreground"
            >
              <History className="h-5 w-5" />
              Donation History
            </Link>

            <Link
              to="/donor/settings"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-background hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>

          </nav>

        </div>
      )}

      {/* ======================================================
          MAIN APPLICATION
      ====================================================== */}

      <div className="flex min-h-[calc(100vh-4rem)]">

        {/* ====================================================
            SIDEBAR
        ==================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-line bg-white lg:block">

          <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-5">

            <nav className="space-y-1">

              <Link
                to="/donor/dashboard"
                className="flex items-center gap-3 rounded-xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary"
              >
                <HeartPulse className="h-5 w-5" />
                Dashboard
              </Link>

              <Link
                to="/donor/profile"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
              >
                <UserRound className="h-5 w-5" />
                My Profile
              </Link>

              <Link
                to="/donor/requests"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
              >
                <Droplet className="h-5 w-5" />
                Blood Requests
              </Link>

              <Link
                to="/donor/notifications"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
                Notifications
              </Link>

              <Link
                to="/donor/history"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
              >
                <History className="h-5 w-5" />
                Donation History
              </Link>

              <Link
                to="/donor/settings"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>

            </nav>

            <div className="mt-auto rounded-2xl bg-gradient-to-br from-primary-soft to-secondary-soft p-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-foreground">
                Every donation matters
              </h3>

              <p className="mt-2 text-xs leading-5 text-muted">
                Your donation can help save lives in your community.
              </p>

            </div>

          </div>

        </aside>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <main className="min-w-0 flex-1 overflow-x-hidden">

          <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">

            {/* =================================================
                HEADER
            ================================================= */}

            <section>

              <p className="text-sm font-semibold text-primary">
                Donor Dashboard
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Welcome back, {userName}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Manage your donor profile, check nearby blood
                requests, and keep track of your donation activity.
              </p>

            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <section className="mt-8">

              <div className="grid gap-4 md:grid-cols-3">

                {/* Blood Group */}

                <div className="rounded-2xl border border-line bg-white p-5 shadow-card">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Blood Group
                      </p>

                      <p className="mt-2 text-3xl font-bold text-red-600">
                        {bloodGroup}
                      </p>

                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <Droplet className="h-6 w-6" />
                    </div>

                  </div>

                  <p className="mt-3 text-xs text-muted">
                    Your registered blood group
                  </p>

                </div>

                {/* Availability */}

                <div className="rounded-2xl border border-line bg-white p-5 shadow-card">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Donation Status
                      </p>

                      <p
                        className={`mt-2 text-xl font-bold ${
                          availability
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {availability
                          ? "Available"
                          : "Unavailable"}
                      </p>

                    </div>

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        availability
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <CheckCircle2 className="h-6 w-6" />
                    </div>

                  </div>

                  <p className="mt-3 text-xs text-muted">
                    Your current donor availability
                  </p>

                </div>

                {/* Last Donation */}

                <div className="rounded-2xl border border-line bg-white p-5 shadow-card">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Last Donation
                      </p>

                      <p className="mt-2 text-lg font-bold text-foreground">
                        {formatDate(lastDonation)}
                      </p>

                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <CalendarDays className="h-6 w-6" />
                    </div>

                  </div>

                  <p className="mt-3 text-xs text-muted">
                    Your most recent recorded donation
                  </p>

                </div>

              </div>

            </section>

            {/* =================================================
                TWO COLUMN
            ================================================= */}

            <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">

              {/* =================================================
                  BLOOD REQUESTS
              ================================================= */}

              <div className="rounded-2xl border border-line bg-white shadow-card">

                <div className="flex items-center justify-between border-b border-line px-6 py-5">

                  <div>

                    <h2 className="font-bold text-foreground">
                      Nearby Blood Requests
                    </h2>

                    <p className="mt-1 text-xs text-muted">
                      Emergency requests matching your blood group
                    </p>

                  </div>

                  <Link
                    to="/dashboard/requests"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View all
                  </Link>

                </div>

                <div className="p-6">

                  {/* TEMPORARY REQUEST */}

                  <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="flex gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                          <Droplet className="h-5 w-5" />
                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-bold text-foreground">
                              Emergency Request
                            </h3>

                            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                              Urgent
                            </span>

                          </div>

                          <p className="mt-1 text-sm font-semibold text-red-700">
                            {bloodGroup} Blood Required
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="mt-5 rounded-xl bg-white p-4">

                      <p className="text-sm text-muted">
                        Blood requests will appear here when a
                        matching hospital request endpoint is
                        available.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  DONATION INFORMATION
              ================================================= */}

              <div className="rounded-2xl border border-line bg-white shadow-card">

                <div className="border-b border-line px-6 py-5">

                  <h2 className="font-bold text-foreground">
                    Donation Information
                  </h2>

                  <p className="mt-1 text-xs text-muted">
                    Your donation eligibility and history
                  </p>

                </div>

                <div className="space-y-4 p-6">

                  {/* Last Donation */}

                  <div className="rounded-2xl bg-background p-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <CalendarDays className="h-5 w-5" />
                      </div>

                      <div>

                        <p className="text-xs text-muted">
                          Last Donation
                        </p>

                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {formatDate(lastDonation)}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Status */}

                  <div
                    className={`rounded-2xl p-4 ${
                      availability
                        ? "bg-emerald-50"
                        : "bg-red-50"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white ${
                          availability
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </div>

                      <div>

                        <p
                          className={`text-xs ${
                            availability
                              ? "text-emerald-700"
                              : "text-red-700"
                          }`}
                        >
                          Current Status
                        </p>

                        <p
                          className={`mt-1 text-sm font-semibold ${
                            availability
                              ? "text-emerald-800"
                              : "text-red-800"
                          }`}
                        >
                          {availability
                            ? "Available to donate"
                            : "Currently unavailable"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Eligibility */}

                  <div className="rounded-2xl border border-line p-4">

                    <p className="text-xs font-semibold text-muted">
                      Donor Information
                    </p>

                    <p className="mt-2 text-sm font-bold text-foreground">
                      {donor?.phone || "Phone not available"}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted">
                      Your registered donor contact information.
                    </p>

                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link to="/dashboard/history">
                      <History className="h-4 w-4" />
                      View Donation History
                    </Link>
                  </Button>

                </div>

              </div>

            </section>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">

              <div>

                <h2 className="font-bold text-foreground">
                  Quick Actions
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Quickly access your donor features.
                </p>

              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">

                <Button
                  asChild
                  variant="outline"
                >
                  <Link to="/dashboard/profile">
                    <UserRound className="h-4 w-4" />
                    My Profile
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                >
                  <Link to="/dashboard/requests">
                    <Droplet className="h-4 w-4" />
                    Blood Requests
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                >
                  <Link to="/dashboard/notifications">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </Link>
                </Button>

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  );
}