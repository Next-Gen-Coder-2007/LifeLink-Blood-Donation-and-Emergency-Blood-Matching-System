import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Droplet,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/Button";

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

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function DonorProfilePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored =
          localStorage.getItem("user") ||
          localStorage.getItem("lifelink_session");

        if (!stored) return;

        const session = JSON.parse(stored);
        const sessionUser = session.user || session;

        setUser(sessionUser);

        const response = await fetch(
          "http://127.0.0.1:8000/donors"
        );

        if (!response.ok) {
          throw new Error("Unable to load donor profile.");
        }

        const donors: Donor[] = await response.json();

        const currentDonor = donors.find(
          (item) =>
            String(item.user_id) === String(sessionUser.id)
        );

        setDonor(currentDonor || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}

      <header className="sticky top-0 z-50 border-b border-line bg-white">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">

          <Link
            to="/donor/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
            {user?.name?.charAt(0).toUpperCase() || "D"}
          </div>

        </div>
      </header>

      {/* Content */}

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        <div>
          <p className="text-sm font-semibold text-primary">
            Donor Account
          </p>

          <h1 className="mt-1 text-3xl font-bold text-foreground">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-muted">
            View your registered donor information.
          </p>
        </div>

        {/* Profile card */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-card">

          <div className="border-b border-line px-6 py-6">
            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-xl font-bold text-primary">
                {user?.name?.charAt(0).toUpperCase() || "D"}
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {user?.name || "Donor"}
                </h2>

                <p className="text-sm text-muted">
                  {user?.email || "Email unavailable"}
                </p>
              </div>

            </div>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">

            <div className="rounded-xl border border-line p-4">
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted">Full Name</p>
                  <p className="mt-1 font-semibold">
                    {user?.name || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted">Email</p>
                  <p className="mt-1 font-semibold">
                    {user?.email || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line p-4">
              <div className="flex items-center gap-3">
                <Droplet className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-xs text-muted">Blood Group</p>
                  <p className="mt-1 font-bold text-red-600">
                    {donor?.blood_group || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted">Phone</p>
                  <p className="mt-1 font-semibold">
                    {donor?.phone || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted">Location</p>
                  <p className="mt-1 font-semibold">
                    {donor
                      ? `${donor.latitude}, ${donor.longitude}`
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line p-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted">
                    Last Donation
                  </p>
                  <p className="mt-1 font-semibold">
                    {donor?.last_donation_date
                      ? new Date(
                          donor.last_donation_date
                        ).toLocaleDateString()
                      : "No donation recorded"}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end border-t border-line px-6 py-5">
            <Button disabled>
              <Save className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>

        </section>

      </main>
    </div>
  );
}