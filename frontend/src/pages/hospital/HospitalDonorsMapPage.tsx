import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Layers, LayoutDashboard, Sparkles } from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { HospitalDonorMap } from "@/components/hospital/HospitalDonorMap";
import { DirectRequestModal } from "@/components/hospital/DirectRequestModal";
import { ProximityMapNetwork } from "@/components/common/ProximityMapNetwork";
import type { DonorMapItem } from "@/types";

interface HospitalData {
  id: string;
  user_id: string;
  hospital_name: string;
  phone: string;
  emergency_contact: string;
  address: string;
  latitude: number;
  longitude: number;
}

export function HospitalDonorsMapPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [hospital, setHospital] = useState<HospitalData | null>(null);
  const [donors, setDonors] = useState<DonorMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [directModalOpen, setDirectModalOpen] = useState(false);
  const [targetDonor, setTargetDonor] = useState<DonorMapItem | null>(null);

  const role = session?.user.role || "donor";
  const isHospital = role === "hospital";

  const loadMapData = async () => {
    try {
      if (isHospital && session?.user.id) {
        const current = await api.get<HospitalData>(`/hospitals/user/${session.user.id}`);

        if (current) {
          setHospital(current);

          const donorList = await api.get<DonorMapItem[]>("/donors");
          setDonors(donorList);

          if ("geolocation" in navigator && (!current.latitude || current.latitude === 0)) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const lat = Number(pos.coords.latitude.toFixed(5));
                const lng = Number(pos.coords.longitude.toFixed(5));
                if (current && (current.latitude !== lat || current.longitude !== lng)) {
                  api.put(`/hospitals/${current.id}`, { latitude: lat, longitude: lng }).catch(() => {});
                  setHospital((prev) => (prev ? { ...prev, latitude: lat, longitude: lng } : prev));
                }
              },
              () => {},
              { timeout: 5000 }
            );
          }
        }
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to load radar map", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, [session?.user.id, isHospital]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMapData();
  };

  const handleOpenDirectPing = (donor: DonorMapItem) => {
    setTargetDonor(donor);
    setDirectModalOpen(true);
  };

  const handleSendDirectRequest = async (donorId: string, message: string) => {
    if (!hospital) return;
    try {
      await api.post(`/donors/${donorId}/direct-request`, {
        hospital_id: hospital.id,
        message,
      });
      showToast("Direct emergency ping dispatched to donor!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to dispatch ping", "error");
      throw err;
    }
  };

  // If user is a donor (or admin/public), show Hospital Blood Bank Proximity Radar
  if (!isHospital) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <PageHeader
          backTo={role === "admin" ? "/admin/dashboard" : "/donor/dashboard"}
          title="Worldwide Hospital Blood Bank Radar"
          description="Track registered medical facility blood reserves, live stock availability, and emergency shortages"
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(role === "admin" ? "/admin/dashboard" : "/donor/dashboard")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate("/donor/requests")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Emergency Matches
              </button>
            </div>
          }
        />

        <ProximityMapNetwork />
      </div>
    );
  }

  // Hospital View: Hospital Donor Locator Radar
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/hospital/dashboard"
        title="Live Donor Locator Radar"
        description="Interactive geographic tracking of active & nearby blood donors"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
              Refresh Radar
            </button>
            <button
              type="button"
              onClick={() => navigate("/hospital/blood-bank")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Layers className="h-3.5 w-3.5" />
              Blood Bank
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-500 mb-3" />
          <p>Calibrating hospital satellite radar...</p>
        </div>
      ) : (
        <HospitalDonorMap
          hospitalName={hospital?.hospital_name || "Emergency Medical Facility"}
          hospitalLat={hospital?.latitude || 40.7128}
          hospitalLng={hospital?.longitude || -74.006}
          donors={donors}
          onDirectRequest={handleOpenDirectPing}
        />
      )}

      <DirectRequestModal
        isOpen={directModalOpen}
        onClose={() => setDirectModalOpen(false)}
        donor={targetDonor}
        hospitalName={hospital?.hospital_name || "Medical Facility"}
        onSendDirectRequest={handleSendDirectRequest}
      />
    </div>
  );
}
