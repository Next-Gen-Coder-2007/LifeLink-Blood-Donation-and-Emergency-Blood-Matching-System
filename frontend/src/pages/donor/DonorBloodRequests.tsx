import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { DonorRequestCard, type DonorRequestItem } from "@/components/donor/DonorRequestCard";
import { DonorRouteMap } from "@/components/donor/DonorRouteMap";
import { EmptyState } from "@/components/ui/EmptyState";

interface DonorProfile {
  id: string;
  user_id: string;
  blood_group: string;
  latitude: number;
  longitude: number;
}

export function DonorBloodRequests() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [requests, setRequests] = useState<DonorRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || session.user.role !== "donor") {
      navigate("/");
      return;
    }

    const fetchRequests = async () => {
      try {
        const donors = await api.get<DonorProfile[]>("/donors");
        const profile = donors.find((d) => String(d.user_id) === String(session.user.id));
        if (profile) {
          setDonorProfile(profile);
          const res = await api.get<DonorRequestItem[]>(`/blood-requests/donor/${profile.id}`);
          setRequests(res);
        }
      } catch {
        showToast("Unable to load matching requests", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [session, navigate]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/donor/dashboard"
        title="Matching Emergency Blood Requests"
        description="Hospitals actively seeking blood matching your type"
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            Live Donor Radar
          </span>
        }
      />

      <Card>
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Scanning hospital network for matching requests...</div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No active emergency requests"
            description="All local hospital blood bank stocks are currently stabilized."
          />
        ) : (
          <div className="space-y-6">
            {requests.map((req) => (
              <div key={req.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <DonorRequestCard request={req} />

                {donorProfile && req.hospital_latitude && req.hospital_longitude && (
                  <DonorRouteMap
                    donorLat={donorProfile.latitude || 40.7128}
                    donorLng={donorProfile.longitude || -74.006}
                    hospitalName={req.hospital_name || "Emergency Medical Facility"}
                    hospitalLat={req.hospital_latitude}
                    hospitalLng={req.hospital_longitude}
                    address={req.hospital_address}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
