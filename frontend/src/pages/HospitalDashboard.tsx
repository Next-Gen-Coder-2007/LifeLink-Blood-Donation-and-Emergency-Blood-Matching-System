import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Building2,
  ChevronRight,
  Droplet,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  X,
} from "lucide-react";

import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";

interface Hospital {
  id: string;
  user_id: string;
  hospital_name: string;
  phone: string;
  emergency_contact: string;
  latitude: number;
  longitude: number;
  address: string;
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

interface BloodInventory {
  blood_group: string;
  units: number;
}

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

function getInventoryStatus(units: number) {
  if (units <= 2) {
    return {
      label: "Critical",
      className: "bg-red-50 text-red-600",
    };
  }

  if (units <= 5) {
    return {
      label: "Low",
      className: "bg-amber-50 text-amber-600",
    };
  }

  return {
    label: "Healthy",
    className: "bg-emerald-50 text-emerald-600",
  };
}

export function HospitalDashboard() {
  const { showToast } = useToast();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);

  const [adminName, setAdminName] = useState("Hospital Administrator");

  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      /*
       * ---------------------------------------------------------
       * GET LOGGED-IN USER
       * ---------------------------------------------------------
       */

      const storedSession =
        localStorage.getItem("user") ||
        localStorage.getItem("lifelink_session");

      if (!storedSession) {
        throw new Error("Hospital session not found.");
      }

      const session = JSON.parse(storedSession);

      const sessionUser = session.user || session;

      const userId = sessionUser.id;

      setAdminName(
  sessionUser.name || "Hospital Administrator"
);

      if (!userId) {
        throw new Error("User ID not found in session.");
      }

      /*
       * ---------------------------------------------------------
       * GET HOSPITALS
       * ---------------------------------------------------------
       */

      const hospitalResponse = await fetch(
        "http://127.0.0.1:8000/hospitals"
      );

      if (!hospitalResponse.ok) {
        throw new Error("Unable to load hospital information.");
      }

      const hospitals: Hospital[] =
        await hospitalResponse.json();

      /*
       * Find hospital belonging to logged-in user
       */

      const currentHospital = hospitals.find(
        (item) =>
          String(item.user_id) === String(userId)
      );

      if (!currentHospital) {
        throw new Error(
          "Hospital profile not found for this user."
        );
      }

      setHospital(currentHospital);

      /*
       * ---------------------------------------------------------
       * GET BLOOD BANK
       * ---------------------------------------------------------
       */

      const bloodBankResponse = await fetch(
        `http://127.0.0.1:8000/hospitals/${currentHospital.id}/blood-bank`
      );

      if (!bloodBankResponse.ok) {
        throw new Error(
          "Unable to load blood-bank inventory."
        );
      }

      const bloodBank: BloodInventory[] =
        await bloodBankResponse.json();

      setInventory(bloodBank);

      /*
       * ---------------------------------------------------------
       * GET DONORS
       * ---------------------------------------------------------
       *
       * This endpoint already exists in main.py.
       */

      const donorResponse = await fetch(
        "http://127.0.0.1:8000/donors"
      );

      if (donorResponse.ok) {
        const donorData: Donor[] =
          await donorResponse.json();

        setDonors(donorData);
      }
    } catch (error) {
      console.error(error);

      showToast(
        error instanceof Error
          ? error.message
          : "Unable to load hospital dashboard.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /*
   * ---------------------------------------------------------
   * INVENTORY MAP
   * ---------------------------------------------------------
   */

  const inventoryMap = useMemo(() => {
    const map: Record<string, number> = {};

    inventory.forEach((item) => {
      map[item.blood_group] = item.units;
    });

    return map;
  }, [inventory]);

  /*
   * ---------------------------------------------------------
   * STATISTICS
   * ---------------------------------------------------------
   */

  const totalUnits = useMemo(() => {
    return inventory.reduce(
      (total, item) => total + item.units,
      0
    );
  }, [inventory]);

  const criticalGroups = useMemo(() => {
    return BLOOD_GROUPS.filter(
      (group) => (inventoryMap[group] || 0) <= 2
    ).length;
  }, [inventoryMap]);

  const lowGroups = useMemo(() => {
    return BLOOD_GROUPS.filter((group) => {
      const units = inventoryMap[group] || 0;

      return units > 2 && units <= 5;
    }).length;
  }, [inventoryMap]);

  const availableDonors = donors.filter(
    (donor) => donor.availability
  ).length;

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("lifelink_session");

    showToast("You have been logged out.", "info");

    window.location.href = "/login";
  };

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

          <p className="mt-4 text-sm text-muted">
            Loading hospital dashboard...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * PAGE
   * ---------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-white px-4 lg:hidden">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <Droplet className="h-5 w-5" />
          </div>

          <span className="font-bold text-foreground">
            LifeLink
          </span>

        </div>

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(!mobileMenuOpen)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

      </header>

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden">

          <aside className="absolute left-0 top-16 h-[calc(100vh-4rem)] w-72 border-r border-line bg-white p-4">

            <HospitalSidebar
              closeMenu={() =>
                setMobileMenuOpen(false)
              }
              onLogout={handleLogout}
            />

          </aside>

        </div>
      )}

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white lg:block">

        <div className="flex h-full flex-col">

          {/* Logo */}

          <div className="flex h-16 items-center gap-3 border-b border-line px-6">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <Droplet className="h-5 w-5" />
            </div>

            <span className="text-lg font-bold text-foreground">
              LifeLink
            </span>

          </div>

          <div className="flex-1 p-4">

            <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-muted">
              Hospital Management
            </p>

            <HospitalSidebar
              onLogout={handleLogout}
            />

          </div>

          {/* Hospital */}

          <div className="border-t border-line p-4">

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Building2 className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {hospital?.hospital_name ||
                    "Hospital"}
                </p>

                <p className="truncate text-xs text-muted">
                  Hospital Account
                </p>
              </div>

            </div>

          </div>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="lg:ml-64">

        {/* Top bar */}

        <div className="hidden h-16 items-center justify-between border-b border-line bg-white px-8 lg:flex">

          <div />

          <div className="flex items-center gap-4">

            <Link
              to="/hospital/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-slate-100 hover:text-foreground"
            >
              <Bell className="h-5 w-5" />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Link>

            <div className="h-6 w-px bg-line" />

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                {hospital?.hospital_name
                  ?.charAt(0)
                  .toUpperCase() || "H"}
              </div>

              <div>

                    <p className="text-sm font-semibold">
                    {adminName}
                    </p>

                    <p className="text-xs text-muted">
                    Hospital Administrator
                    </p>

              </div>

            </div>

          </div>

        </div>

        {/* Page content */}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* =================================================
              WELCOME
          ================================================= */}

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <p className="text-sm font-semibold text-primary">
                Hospital Dashboard
              </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Welcome back, {adminName}
                    </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Manage your blood inventory, monitor donor
                availability, and handle emergency blood
                requirements from one place.
              </p>

            </div>

            <Link to="/hospital/blood-bank">
              <Button>
                <Droplet className="h-4 w-4" />
                Manage Blood Bank
              </Button>
            </Link>

          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* Total Units */}

            <StatCard
              label="Total Blood Units"
              value={totalUnits}
              description="Across all blood groups"
              icon={<Package className="h-5 w-5" />}
              iconClass="bg-primary-soft text-primary"
            />

            {/* Available Donors */}

            <StatCard
              label="Available Donors"
              value={availableDonors}
              description="Currently available"
              icon={<Search className="h-5 w-5" />}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            {/* Low */}

            <StatCard
              label="Low Stock Groups"
              value={lowGroups}
              description="Needs attention"
              icon={<Droplet className="h-5 w-5" />}
              iconClass="bg-amber-50 text-amber-600"
            />

            {/* Critical */}

            <StatCard
              label="Critical Groups"
              value={criticalGroups}
              description="Immediate attention"
              icon={<Bell className="h-5 w-5" />}
              iconClass="bg-red-50 text-red-600"
            />

          </section>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">

            {/* =================================================
                BLOOD BANK
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-line px-5 py-5 sm:px-6">

                <div>

                  <div className="flex items-center gap-2">

                    <Droplet className="h-5 w-5 text-red-500" />

                    <h2 className="font-bold text-foreground">
                      Blood Bank Inventory
                    </h2>

                  </div>

                  <p className="mt-1 text-xs text-muted">
                    Current availability by blood group
                  </p>

                </div>

                <Link
                  to="/hospital/blood-bank"
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Manage
                  <ChevronRight className="h-4 w-4" />
                </Link>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[600px]">

                  <thead>

                    <tr className="border-b border-line bg-slate-50 text-left">

                      <th className="px-5 py-3 text-xs font-semibold text-muted">
                        Blood Group
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-muted">
                        Available
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-muted">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold text-muted">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {BLOOD_GROUPS.map((group) => {

                      const units =
                        inventoryMap[group] || 0;

                      const status =
                        getInventoryStatus(units);

                      return (
                        <tr
                          key={group}
                          className="border-b border-line last:border-0"
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-sm font-bold text-red-600">
                                {group}
                              </div>

                              <span className="font-semibold">
                                {group}
                              </span>

                            </div>

                          </td>

                          <td className="px-5 py-4 text-sm font-semibold">
                            {units}{" "}
                            {units === 1
                              ? "unit"
                              : "units"}
                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>

                          </td>

                          <td className="px-5 py-4 text-right">

                            <Link
                              to="/hospital/blood-bank"
                              className="text-sm font-semibold text-primary hover:underline"
                            >
                              Manage
                            </Link>

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

            </section>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div className="space-y-6">

              <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">

                <h2 className="font-bold text-foreground">
                  Quick Actions
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Frequently used hospital tools
                </p>

                <div className="mt-5 space-y-3">

                  <Link
                    to="/hospital/blood-bank"
                    className="flex items-center gap-3 rounded-xl border border-line p-4 transition hover:border-primary/30 hover:bg-primary-soft/40"
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      <Droplet className="h-5 w-5" />
                    </div>

                    <div className="flex-1">

                      <p className="text-sm font-semibold">
                        Blood Bank
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        Update blood stock
                      </p>

                    </div>

                    <ChevronRight className="h-4 w-4 text-muted" />

                  </Link>

                  <Link
                    to="/hospital/donors"
                    className="flex items-center gap-3 rounded-xl border border-line p-4 transition hover:border-primary/30 hover:bg-primary-soft/40"
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Search className="h-5 w-5" />
                    </div>

                    <div className="flex-1">

                      <p className="text-sm font-semibold">
                        Find Donors
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        Search available donors
                      </p>

                    </div>

                    <ChevronRight className="h-4 w-4 text-muted" />

                  </Link>

                  <Link
                    to="/hospital/notifications"
                    className="flex items-center gap-3 rounded-xl border border-line p-4 transition hover:border-primary/30 hover:bg-primary-soft/40"
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Bell className="h-5 w-5" />
                    </div>

                    <div className="flex-1">

                      <p className="text-sm font-semibold">
                        Notifications
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        View hospital alerts
                      </p>

                    </div>

                    <ChevronRight className="h-4 w-4 text-muted" />

                  </Link>

                </div>

              </section>

              {/* =================================================
                  REQUEST PLACEHOLDER
              ================================================= */}

              <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Bell className="h-5 w-5" />
                  </div>

                  <div>

                    <h2 className="font-bold">
                      Blood Requests
                    </h2>

                    <p className="mt-1 text-xs text-muted">
                      Emergency requests
                    </p>

                  </div>

                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">

                  <p className="text-sm font-semibold">
                    No active requests
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted">
                    Blood request management will appear
                    here once the request API is connected.
                  </p>

                </div>

              </section>

            </div>

          </div>

          {/* =================================================
              HOSPITAL INFORMATION
          ================================================= */}

          <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Building2 className="h-5 w-5" />
              </div>

              <div>

                <h2 className="font-bold">
                  Hospital Information
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Registered hospital details
                </p>

              </div>

            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <InfoItem
                label="Hospital"
                value={
                  hospital?.hospital_name || "-"
                }
              />

              <InfoItem
                label="Phone"
                value={hospital?.phone || "-"}
              />

              <InfoItem
                label="Emergency Contact"
                value={
                  hospital?.emergency_contact || "-"
                }
              />

              <InfoItem
                label="Address"
                value={hospital?.address || "-"}
              />

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}

function StatCard({
  label,
  value,
  description,
  icon,
  iconClass,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-foreground">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted">
            {description}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ============================================================
   INFO ITEM
============================================================ */

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({
  label,
  value,
}: InfoItemProps) {
  return (
    <div className="rounded-xl border border-line p-4">

      <p className="text-xs font-medium text-muted">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-foreground">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   HOSPITAL SIDEBAR
============================================================ */

interface HospitalSidebarProps {
  closeMenu?: () => void;
  onLogout: () => void;
}

function HospitalSidebar({
  closeMenu,
  onLogout,
}: HospitalSidebarProps) {

  const handleClick = () => {
    closeMenu?.();
  };

  return (
    <nav className="space-y-1">

      <Link
        to="/hospital/dashboard"
        onClick={handleClick}
        className="flex items-center gap-3 rounded-xl bg-primary-soft px-3 py-3 text-sm font-semibold text-primary"
      >
        <LayoutDashboard className="h-5 w-5" />
        Dashboard
      </Link>

      <Link
        to="/hospital/blood-bank"
        onClick={handleClick}
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition hover:bg-slate-100 hover:text-foreground"
      >
        <Droplet className="h-5 w-5" />
        Blood Bank
      </Link>

      <Link
        to="/hospital/requests"
        onClick={handleClick}
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition hover:bg-slate-100 hover:text-foreground"
      >
        <Package className="h-5 w-5" />
        Blood Requests
      </Link>

      <Link
        to="/hospital/donors"
        onClick={handleClick}
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition hover:bg-slate-100 hover:text-foreground"
      >
        <Search className="h-5 w-5" />
        Find Donors
      </Link>

      <Link
        to="/hospital/notifications"
        onClick={handleClick}
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition hover:bg-slate-100 hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        Notifications
      </Link>

      <Link
        to="/hospital/settings"
        onClick={handleClick}
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition hover:bg-slate-100 hover:text-foreground"
      >
        <Settings className="h-5 w-5" />
        Settings
      </Link>

      <div className="my-4 border-t border-line" />

      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>

    </nav>
  );
}