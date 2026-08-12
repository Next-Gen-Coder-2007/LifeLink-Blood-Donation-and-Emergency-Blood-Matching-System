import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Droplet,
  MapPin,
  Clock,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/Button";

export function BloodRequestsPage() {
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

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-white">
            <Droplet className="h-5 w-5" />
          </div>

        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        <p className="text-sm font-semibold text-primary">
          Donor Network
        </p>

        <h1 className="mt-1 text-3xl font-bold text-foreground">
          Blood Requests
        </h1>

        <p className="mt-2 text-sm text-muted">
          View nearby blood requests that may match your blood group.
        </p>

        <section className="mt-8">

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-foreground">
                Nearby Requests
              </h2>

              <p className="mt-1 text-xs text-muted">
                Emergency blood requirements
              </p>
            </div>
          </div>

          {/* Empty state */}

          <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Droplet className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-foreground">
              No blood requests available
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              New matching blood requests from hospitals
              will appear here.
            </p>

          </div>

          {/* Example request UI - connect to API later */}

          <div className="mt-6 hidden rounded-2xl border border-red-100 bg-white shadow-card">

            <div className="border-b border-line p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <Droplet className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Emergency Blood Request
                    </h3>

                    <p className="text-xs text-muted">
                      Hospital
                    </p>
                  </div>

                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                  URGENT
                </span>

              </div>

            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-3">

              <div>
                <p className="text-xs text-muted">
                  Blood Group
                </p>
                <p className="mt-1 font-bold text-red-600">
                  B+
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Distance
                </p>
                <p className="mt-1 flex items-center gap-1 font-semibold">
                  <MapPin className="h-4 w-4 text-primary" />
                  3.2 km
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Required
                </p>
                <p className="mt-1 font-semibold">
                  2 units
                </p>
              </div>

            </div>

            <div className="flex items-center justify-between border-t border-line p-5">

              <span className="flex items-center gap-2 text-xs text-muted">
                <Clock className="h-4 w-4" />
                Recently posted
              </span>

              <Button>
                Respond
              </Button>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}