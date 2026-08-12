import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Droplet,
  History,
} from "lucide-react";

export function DonationHistoryPage() {
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
            <History className="h-5 w-5" />
          </div>

        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        <p className="text-sm font-semibold text-primary">
          Donor Activity
        </p>

        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Donation History
        </h1>

        <p className="mt-2 text-sm text-muted">
          Keep track of your previous blood donations.
        </p>

        {/* Summary */}

        <section className="mt-8 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">

            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Total Donations
            </p>

            <p className="mt-2 text-3xl font-bold text-foreground">
              0
            </p>

            <p className="mt-2 text-xs text-muted">
              Recorded donations
            </p>

          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">

            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Last Donation
            </p>

            <p className="mt-2 text-lg font-bold text-foreground">
              No donation recorded
            </p>

            <p className="mt-2 text-xs text-muted">
              Your latest donation
            </p>

          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">

            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Status
            </p>

            <p className="mt-2 text-lg font-bold text-emerald-600">
              Ready
            </p>

            <p className="mt-2 text-xs text-muted">
              Donation records are up to date
            </p>

          </div>

        </section>

        {/* History */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-card">

          <div className="border-b border-line px-6 py-5">

            <h2 className="font-bold text-foreground">
              Previous Donations
            </h2>

            <p className="mt-1 text-xs text-muted">
              Your recorded donation activity
            </p>

          </div>

          <div className="p-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <CalendarDays className="h-7 w-7" />
            </div>

            <h3 className="mt-5 font-bold text-foreground">
              No donation history yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Once a donation is recorded, its date and
              related information will appear here.
            </p>

          </div>

        </section>

      </main>
    </div>
  );
}