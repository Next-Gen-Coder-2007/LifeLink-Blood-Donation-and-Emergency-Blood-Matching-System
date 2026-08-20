import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplet, Activity, Bell, Calendar, CheckCircle2 } from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { AvailabilityToggle } from "@/components/donor/AvailabilityToggle";
import { DonorRequestCard, type DonorRequestItem } from "@/components/donor/DonorRequestCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface DonorData {
  id: string;
  user_id: string;
  blood_group: string;
  phone: string;
  latitude: number;
  longitude: number;
  availability: boolean;
  last_donation_date?: string;
}

export function DonorDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [donor, setDonor] = useState<DonorData | null>(null);
  const [matchingRequests, setMatchingRequests] = useState<DonorRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || session.user.role !== "donor") {
      navigate("/login");
      return;
    }

    const loadDonorData = async () => {
      try {
        const donors = await api.get<DonorData[]>("/donors");
        const myProfile = donors.find((d) => String(d.user_id) === String(session.user.id));
        if (myProfile) {
          setDonor(myProfile);
          const reqs = await api.get<DonorRequestItem[]>(`/blood-requests/donor/${myProfile.id}`);
          setMatchingRequests(reqs.filter((r) => r.status === "searching"));
        }
      } catch {
        showToast("Failed to load donor data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadDonorData();
  }, [session, navigate]);

  const toggleAvailability = async () => {
    if (!donor) return;
    try {
      const nextStatus = !donor.availability;
      await api.put(`/donors/${donor.id}`, { availability: nextStatus });
      setDonor({ ...donor, availability: nextStatus });
      showToast(`Status updated: ${nextStatus ? "Available for donations" : "Currently Offline"}`);
    } catch {
      showToast("Could not update availability status", "error");
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading donor portal...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 font-black text-xl shadow-xs">
            {donor?.blood_group || "O+"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{session?.user.name}</h1>
              <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Donor</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{donor?.phone} • {session?.user.email}</p>
          </div>
        </div>

        <div>
          <AvailabilityToggle
            available={donor?.availability ?? true}
            onToggle={toggleAvailability}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Activity}
          iconColor="text-red-500"
          value={matchingRequests.length}
          label="Matching Requests"
          to="/donor/requests"
        />
        <StatCard
          icon={Droplet}
          iconColor="text-blue-500"
          value={donor?.blood_group || "O+"}
          label="Blood Type"
          to="/donor/profile"
        />
        <StatCard
          icon={Calendar}
          iconColor="text-emerald-500"
          value={donor?.last_donation_date ? "Logged" : "None"}
          label="Donation History"
          to="/donor/history"
        />
        <StatCard
          icon={Bell}
          iconColor="text-amber-500"
          value="Active"
          label="Emergency Radar"
          to="/donor/notifications"
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Nearby Emergency Matching Requests</CardTitle>
            <CardDescription>Live requests matching your blood group ({donor?.blood_group})</CardDescription>
          </div>
          <Link to="/donor/requests" className="text-xs font-semibold text-red-500 hover:text-red-600">
            View All →
          </Link>
        </CardHeader>

        {matchingRequests.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No urgent requests right now"
            description="You will be notified immediately when a nearby hospital broadcasts a match."
          />
        ) : (
          <div className="mt-4 space-y-3">
            {matchingRequests.slice(0, 3).map((req) => (
              <DonorRequestCard key={req.id} request={req} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
