import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";

export function DonorSettingsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);

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

  return (
    <div className="min-h-screen bg-background">

      <header className="sticky top-0 z-50 border-b border-line bg-white">

        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">

          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Settings className="h-5 w-5" />
          </div>

        </div>

      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        <p className="text-sm font-semibold text-primary">
          Donor Account
        </p>

        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Settings
        </h1>

        <p className="mt-2 text-sm text-muted">
          Manage your donor dashboard preferences.
        </p>

        {/* Notifications */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-card">

          <div className="border-b border-line px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Bell className="h-5 w-5" />
              </div>

              <div>

                <h2 className="font-bold text-foreground">
                  Notifications
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Control how LifeLink keeps you informed.
                </p>

              </div>

            </div>

          </div>

          <div className="divide-y divide-line">

            {/* General notifications */}

            <div className="flex items-center justify-between gap-6 p-6">

              <div>

                <p className="font-semibold text-foreground">
                  Notifications
                </p>

                <p className="mt-1 text-sm text-muted">
                  Receive updates about your donor activity.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setNotifications(!notifications)
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  notifications
                    ? "bg-primary"
                    : "bg-slate-300"
                }`}
                aria-label="Toggle notifications"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    notifications
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>

            </div>

            {/* Emergency */}

            <div className="flex items-center justify-between gap-6 p-6">

              <div>

                <p className="font-semibold text-foreground">
                  Emergency Blood Alerts
                </p>

                <p className="mt-1 text-sm text-muted">
                  Receive urgent requests matching your blood group.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setEmergencyAlerts(
                    !emergencyAlerts
                  )
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  emergencyAlerts
                    ? "bg-primary"
                    : "bg-slate-300"
                }`}
                aria-label="Toggle emergency alerts"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    emergencyAlerts
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>

            </div>

          </div>

        </section>

        {/* Account */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-card">

          <div className="border-b border-line px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <UserRound className="h-5 w-5" />
              </div>

              <div>

                <h2 className="font-bold text-foreground">
                  Account
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Manage your LifeLink account.
                </p>

              </div>

            </div>

          </div>

          <div className="space-y-4 p-6">

            <Link
              to="/dashboard/profile"
              className="flex items-center justify-between rounded-xl border border-line p-4 transition hover:bg-background"
            >

              <div className="flex items-center gap-3">

                <UserRound className="h-5 w-5 text-primary" />

                <div>
                  <p className="font-semibold text-foreground">
                    My Profile
                  </p>

                  <p className="text-xs text-muted">
                    View your donor information
                  </p>
                </div>

              </div>

              <span className="text-sm text-primary">
                View
              </span>

            </Link>

            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4">

              <ShieldCheck className="h-5 w-5 text-emerald-600" />

              <div>

                <p className="font-semibold text-emerald-800">
                  Secure Account
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  Your LifeLink account is protected.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* Logout */}

        <section className="mt-6 rounded-2xl border border-red-100 bg-white p-6 shadow-card">

          <h2 className="font-bold text-foreground">
            Sign out
          </h2>

          <p className="mt-1 text-sm text-muted">
            Sign out from your LifeLink donor account.
          </p>

          <Button
            variant="outline"
            className="mt-5 border-red-200 text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>

        </section>

      </main>
    </div>
  );
}