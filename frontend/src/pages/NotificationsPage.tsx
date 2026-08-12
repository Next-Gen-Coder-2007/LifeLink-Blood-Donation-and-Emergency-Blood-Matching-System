import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock,
  Droplet,
  ShieldAlert,
} from "lucide-react";

export function NotificationsPage() {
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
            <Bell className="h-5 w-5" />
          </div>

        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        <p className="text-sm font-semibold text-primary">
          Donor Account
        </p>

        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Notifications
        </h1>

        <p className="mt-2 text-sm text-muted">
          Stay updated about blood requests and your donor activity.
        </p>

        <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-card">

          {/* Notification */}

          <div className="border-b border-line p-5">

            <div className="flex gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Droplet className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h3 className="font-semibold text-foreground">
                      Blood request notification
                    </h3>

                    <p className="mt-1 text-sm text-muted">
                      Matching emergency blood requests will appear here.
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-muted">
                    --
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* System notification */}

          <div className="border-b border-line p-5">

            <div className="flex gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>

                <h3 className="font-semibold text-foreground">
                  Donor account active
                </h3>

                <p className="mt-1 text-sm text-muted">
                  Your LifeLink donor account is active.
                </p>

              </div>

            </div>

          </div>

          {/* Empty state */}

          <div className="p-10 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-background text-muted">
              <Bell className="h-5 w-5" />
            </div>

            <p className="mt-4 text-sm font-semibold text-foreground">
              More notifications will appear here
            </p>

            <p className="mt-1 text-xs text-muted">
              You will be notified when relevant activity occurs.
            </p>

          </div>

        </section>

      </main>
    </div>
  );
}