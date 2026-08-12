import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Building2,
  ChevronDown,
  ClipboardList,
  Droplet,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";

// =========================================================
// TYPES
// =========================================================

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Hospital {
  id?: string;
  hospital_id?: string | number;
  hospital_name?: string;
  name?: string;
  created_at?: string;
}

interface Donor {
  id?: string;
  donor_id?: string | number;
  name?: string;
  blood_group?: string;
  created_at?: string;
}

// =========================================================
// ADMIN DASHBOARD
// =========================================================

export function Admin() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // =========================================================
  // ADMIN SESSION
  // =========================================================

  const getAdminSession = () => {
    try {
      const stored = localStorage.getItem("lifelink_admin");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  // Keep session stable between renders
  const [adminSession] = useState(() =>
    getAdminSession()
  );

  // =========================================================
  // PROFILE
  // =========================================================

  const [showProfile, setShowProfile] = useState(false);

  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  const [users, setUsers] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);

  const [loadingStats, setLoadingStats] = useState(true);

  // =========================================================
  // FETCH DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    if (!adminSession) {
      navigate("/admin/login", {
        replace: true,
      });

      return;
    }

    const fetchDashboardData = async () => {
      setLoadingStats(true);

      // -----------------------------------------------------
      // USERS
      // -----------------------------------------------------

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/users"
        );

        if (!response.ok) {
          throw new Error(
            `Users API returned ${response.status}`
          );
        }

        const data = await response.json();

        console.log("USERS RESPONSE:", data);

        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error(
            "Users API did not return an array:",
            data
          );

          setUsers([]);
        }
      } catch (error) {
        console.error(
          "USERS API ERROR:",
          error
        );

        setUsers([]);
      }

      // -----------------------------------------------------
      // HOSPITALS
      // -----------------------------------------------------

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/hospitals"
        );

        if (!response.ok) {
          throw new Error(
            `Hospitals API returned ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          "HOSPITALS RESPONSE:",
          data
        );

        if (Array.isArray(data)) {
          setHospitals(data);
        } else {
          console.error(
            "Hospitals API did not return an array:",
            data
          );

          setHospitals([]);
        }
      } catch (error) {
        console.error(
          "HOSPITALS API ERROR:",
          error
        );

        setHospitals([]);
      }

      // -----------------------------------------------------
      // DONORS
      // -----------------------------------------------------

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/donors"
        );

        if (!response.ok) {
          throw new Error(
            `Donors API returned ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          "DONORS RESPONSE:",
          data
        );

        if (Array.isArray(data)) {
          setDonors(data);
        } else {
          console.error(
            "Donors API did not return an array:",
            data
          );

          setDonors([]);
        }
      } catch (error) {
        console.error(
          "DONORS API ERROR:",
          error
        );

        setDonors([]);
      }

      setLoadingStats(false);
    };

    fetchDashboardData();
  }, [adminSession, navigate]);

  // =========================================================
  // DON'T RENDER WITHOUT ADMIN
  // =========================================================

  if (!adminSession) {
    return null;
  }

  // =========================================================
  // ADMIN DETAILS
  // =========================================================

  const adminName =
    adminSession?.name || "Administrator";

  const adminEmail =
    adminSession?.email ||
    "admin@lifelink.com";

  const adminRole =
    adminSession?.role || "admin";

  const initials = adminName
    .split(" ")
    .map((part: string) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("lifelink_admin");

    showToast(
      "You have been logged out.",
      "info"
    );

    navigate("/admin/login", {
      replace: true,
    });
  };

  // =========================================================
  // PROFILE MENU
  // =========================================================

  const handleMenuClick = (path: string) => {
    navigate(path);
    setShowProfile(false);
  };

  // =========================================================
  // RECENT REGISTRATIONS
  // =========================================================

  const recentUsers = [...users]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date: string) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-line bg-white">

        <div className="flex h-16 items-center justify-between px-4 sm:px-6">

          <Logo to="/" />

          {/* Admin Profile */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setShowProfile(!showProfile)
              }
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-background"
            >

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                {initials || "AD"}
              </span>

              <div className="hidden text-left sm:block">

                <p className="text-sm font-semibold text-foreground">
                  {adminName}
                </p>

                <p className="text-xs capitalize text-muted">
                  {adminRole}
                </p>

              </div>

              <ChevronDown
                className={`h-4 w-4 text-muted transition-transform ${
                  showProfile
                    ? "rotate-180"
                    : ""
                }`}
              />

            </button>

            {showProfile && (
              <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white shadow-card">

                <div className="border-b border-line p-4">

                  <p className="text-sm font-semibold text-foreground">
                    {adminName}
                  </p>

                  <p className="mt-1 truncate text-xs text-muted">
                    {adminEmail}
                  </p>

                </div>

                <div className="p-2">

                  <button
                    type="button"
                    onClick={() =>
                      handleMenuClick(
                        "/admin/settings"
                      )
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition hover:bg-background"
                  >

                    <Settings className="h-4 w-4 text-muted" />

                    Settings

                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                  >

                    <LogOut className="h-4 w-4" />

                    Logout

                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div className="flex min-h-[calc(100vh-4rem)]">

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-line bg-white lg:block">

          <div className="flex h-full flex-col p-4">

            {/* Admin Identity */}

            <div className="mb-6 rounded-2xl bg-primary-soft p-4">

              <div className="flex items-center gap-3">

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                  {initials || "AD"}
                </span>

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-foreground">
                    {adminName}
                  </p>

                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">

                    <ShieldCheck className="h-3.5 w-3.5 text-secondary" />

                    Administrator

                  </p>

                </div>

              </div>

            </div>

            {/* Navigation */}

            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Administration
            </p>

            <nav className="space-y-1">

              <Link
                to="/admin/dashboard"
                className="flex items-center gap-3 rounded-xl bg-primary-soft px-3 py-2.5 text-sm font-semibold text-primary"
              >

                <LayoutDashboard className="h-4 w-4" />

                Dashboard

              </Link>

              <Link
                to="/admin/donors"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
              >

                <Users className="h-4 w-4" />

                Donors

              </Link>

              <Link
                to="/admin/hospitals"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
              >

                <Building2 className="h-4 w-4" />

                Hospitals

              </Link>

              <Link
                to="/admin/users"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
              >

                <UserRound className="h-4 w-4" />

                Users

              </Link>

              <Link
                to="/admin/requests"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
              >

                <ClipboardList className="h-4 w-4" />

                Requests

                <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                  5
                </span>

              </Link>

              <Link
                to="/admin/settings"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
              >

                <Settings className="h-4 w-4" />

                Settings

              </Link>

            </nav>

            {/* System Status */}

            <div className="mt-auto rounded-2xl border border-line bg-background p-4">

              <div className="flex items-center gap-2">

                <Activity className="h-4 w-4 text-emerald-600" />

                <p className="text-xs font-semibold text-foreground">
                  System Status
                </p>

              </div>

              <div className="mt-2 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <p className="text-xs text-muted">
                  All systems operational
                </p>

              </div>

            </div>

          </div>

        </aside>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <main className="flex-1">

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

            {/* PAGE HEADER */}

            <div className="mb-8">

              <p className="mb-1 text-sm font-medium text-primary">
                Administration
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Dashboard Overview
              </h1>

              <p className="mt-1.5 text-sm text-muted">
                Monitor and manage the LifeLink blood donation network.
              </p>

            </div>

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {/* DONORS */}

              <div className="rounded-2xl border border-line bg-white p-5 shadow-card">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-muted">
                      Total Donors
                    </p>

                    <p className="mt-2 text-3xl font-bold text-foreground">

                      {loadingStats
                        ? "..."
                        : donors.length.toLocaleString()}

                    </p>

                    <p className="mt-2 text-xs text-emerald-600">
                      Registered donors
                    </p>

                  </div>

                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">

                    <Droplet className="h-5 w-5" />

                  </span>

                </div>

              </div>

              {/* HOSPITALS */}

              <div className="rounded-2xl border border-line bg-white p-5 shadow-card">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-muted">
                      Hospitals
                    </p>

                    <p className="mt-2 text-3xl font-bold text-foreground">

                      {loadingStats
                        ? "..."
                        : hospitals.length.toLocaleString()}

                    </p>

                    <p className="mt-2 text-xs text-emerald-600">
                      Registered hospitals
                    </p>

                  </div>

                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">

                    <Building2 className="h-5 w-5" />

                  </span>

                </div>

              </div>

              {/* USERS */}

              <div className="rounded-2xl border border-line bg-white p-5 shadow-card">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-muted">
                      Registered Users
                    </p>

                    <p className="mt-2 text-3xl font-bold text-foreground">

                      {loadingStats
                        ? "..."
                        : users.length.toLocaleString()}

                    </p>

                    <p className="mt-2 text-xs text-emerald-600">
                      Registered accounts
                    </p>

                  </div>

                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-soft text-secondary">

                    <UserRound className="h-5 w-5" />

                  </span>

                </div>

              </div>

              {/* ACTIVE REQUESTS */}

              <div className="rounded-2xl border border-line bg-white p-5 shadow-card">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-muted">
                      Active Requests
                    </p>

                    <p className="mt-2 text-3xl font-bold text-foreground">
                      5
                    </p>

                    <p className="mt-2 text-xs text-red-600">
                      Requires attention
                    </p>

                  </div>

                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">

                    <ClipboardList className="h-5 w-5" />

                  </span>

                </div>

              </div>

            </div>

            {/* =================================================
                RECENT REGISTRATIONS
            ================================================= */}

            <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-card">

              <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="font-semibold text-foreground">
                    Recent Registrations
                  </h2>

                  <p className="mt-1 text-xs text-muted">
                    Recently registered users
                  </p>

                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate("/admin/users")
                  }
                >
                  View all
                </Button>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px]">

                  <thead>

                    <tr className="border-b border-line bg-background">

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                        Name
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                        Email
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                        Role
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                        Registered
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {loadingStats ? (

                      <tr>

                        <td
                          colSpan={5}
                          className="px-5 py-10 text-center text-sm text-muted"
                        >
                          Loading registrations...
                        </td>

                      </tr>

                    ) : recentUsers.length === 0 ? (

                      <tr>

                        <td
                          colSpan={5}
                          className="px-5 py-10 text-center text-sm text-muted"
                        >
                          No registrations found.
                        </td>

                      </tr>

                    ) : (

                      recentUsers.map(
                        (user) => {

                          const role =
                            user.role?.toLowerCase();

                          const isHospital =
                            role === "hospital";

                          const initial =
                            user.name
                              ?.charAt(0)
                              .toUpperCase();

                          return (

                            <tr
                              key={user.id}
                              className="border-b border-line transition hover:bg-background"
                            >

                              {/* NAME */}

                              <td className="px-5 py-4">

                                <div className="flex items-center gap-3">

                                  <span
                                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                                      isHospital
                                        ? "bg-secondary-soft text-secondary"
                                        : "bg-primary-soft text-primary"
                                    }`}
                                  >

                                    {isHospital ? (
                                      <Building2 className="h-4 w-4" />
                                    ) : (
                                      initial
                                    )}

                                  </span>

                                  <span className="text-sm font-semibold text-foreground">
                                    {user.name}
                                  </span>

                                </div>

                              </td>

                              {/* EMAIL */}

                              <td className="px-5 py-4">

                                <span className="text-sm text-muted">
                                  {user.email}
                                </span>

                              </td>

                              {/* ROLE */}

                              <td className="px-5 py-4">

                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                    isHospital
                                      ? "bg-secondary-soft text-secondary"
                                      : "bg-primary-soft text-primary"
                                  }`}
                                >

                                  {isHospital
                                    ? "Hospital"
                                    : "Donor"}

                                </span>

                              </td>

                              {/* DATE */}

                              <td className="px-5 py-4">

                                <span className="text-sm text-muted">
                                  {formatDate(
                                    user.created_at
                                  )}
                                </span>

                              </td>

                              {/* ACTION */}

                              <td className="px-5 py-4 text-right">

                                <button
                                  onClick={() =>
                                    navigate(
                                      "/admin/users"
                                    )
                                  }
                                  className="text-xs font-semibold text-primary hover:underline"
                                >
                                  View
                                </button>

                              </td>

                            </tr>

                          );
                        }
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">

              <button
                onClick={() =>
                  navigate("/admin/donors")
                }
                className="group rounded-2xl border border-line bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-primary/30"
              >

                <div className="flex items-center gap-3">

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">

                    <Droplet className="h-5 w-5" />

                  </span>

                  <div>

                    <p className="text-sm font-semibold text-foreground">
                      Manage Donors
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      View and manage donor records
                    </p>

                  </div>

                </div>

              </button>

              <button
                onClick={() =>
                  navigate("/admin/hospitals")
                }
                className="group rounded-2xl border border-line bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-primary/30"
              >

                <div className="flex items-center gap-3">

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">

                    <Building2 className="h-5 w-5" />

                  </span>

                  <div>

                    <p className="text-sm font-semibold text-foreground">
                      Manage Hospitals
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      View registered hospitals
                    </p>

                  </div>

                </div>

              </button>

              <button
                onClick={() =>
                  navigate("/admin/users")
                }
                className="group rounded-2xl border border-line bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-primary/30"
              >

                <div className="flex items-center gap-3">

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-soft text-secondary">

                    <Users className="h-5 w-5" />

                  </span>

                  <div>

                    <p className="text-sm font-semibold text-foreground">
                      Manage Users
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      Manage system accounts
                    </p>

                  </div>

                </div>

              </button>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}