import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Droplet,
  Plus,
  Activity,
  Phone,
  MapPin,
  Layers,
  Clock,
  Compass,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { BloodMatrixGrid } from "@/components/hospital/BloodMatrixGrid";
import { CreateRequestModal } from "@/components/hospital/CreateRequestModal";
import { UrgencyBadge, StatusBadge } from "@/components/ui/Badge";

interface HospitalData {
  id: string;
  user_id: string;
  hospital_name: string;
  phone: string;
  emergency_contact: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface BloodStock {
  blood_group: string;
  units: number;
}

interface RequestItem {
  id: string;
  blood_group: string;
  units_required: number;
  urgency: string;
  status: string;
  patient_name?: string;
  created_at: string;
}

export function HospitalDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [hospital, setHospital] = useState<HospitalData | null>(null);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [updatingGroup, setUpdatingGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick broadcast modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [prefilledGroup, setPrefilledGroup] = useState<string | undefined>(undefined);

  const loadHospital = async () => {
    try {
      let current: HospitalData | null = null;
      try {
        current = await api.get<HospitalData>(`/hospitals/user/${session?.user.id}`);
      } catch {
        const hospitals = await api.get<HospitalData[]>("/hospitals");
        current = hospitals.find((h) => String(h.user_id) === String(session?.user.id)) || null;
      }

      if (current) {
        setHospital(current);
        const [inventory, reqs] = await Promise.all([
          api.get<BloodStock[]>(`/hospitals/${current.id}/blood-bank`),
          api.get<RequestItem[]>(`/blood-requests/hospital/${current.id}`),
        ]);
        const map: Record<string, number> = {};
        inventory.forEach((i) => {
          map[i.blood_group] = i.units;
        });
        setStockMap(map);
        setRequests(reqs);
      }
    } catch {
      showToast("Unable to load hospital dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || session.user.role !== "hospital") {
      navigate("/login");
      return;
    }
    loadHospital();
  }, [session, navigate]);

  const totalUnits = Object.values(stockMap).reduce((sum, units) => sum + units, 0);
  const activeRequests = requests.filter((r) => r.status === "searching");
  const fulfilledRequests = requests.filter((r) => r.status === "fulfilled" || r.status === "completed");

  // Identify low stocks (< 3 units)
  const lowStockGroups = Object.entries(stockMap).filter(([, units]) => units < 3);

  const handleQuickBroadcast = (group?: string) => {
    setPrefilledGroup(group);
    setShowBroadcastModal(true);
  };

  const handleCreateBroadcast = async (formData: {
    blood_group: string;
    units_required: number;
    urgency: "normal" | "urgent" | "emergency";
    patient_name: string;
  }) => {
    if (!hospital) return;
    try {
      await api.post("/blood-requests", {
        hospital_id: hospital.id,
        blood_group: formData.blood_group,
        units_required: Number(formData.units_required),
        urgency: formData.urgency,
        patient_name: formData.patient_name || null,
      });
      showToast("Emergency broadcast dispatched to local donors!");
      loadHospital();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to broadcast", "error");
      throw err;
    }
  };

  const handleStockUpdate = async (group: string, newUnits: number) => {
    if (!hospital) return;
    setUpdatingGroup(group);
    try {
      await api.put(`/hospitals/${hospital.id}/blood-bank`, {
        blood_group: group,
        units: newUnits,
      });
      setStockMap((prev) => ({ ...prev, [group]: newUnits }));
      showToast(`${group} stock updated to ${newUnits} units`);
    } catch {
      showToast(`Failed to update ${group} inventory`, "error");
    } finally {
      setUpdatingGroup(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-500 mb-3" />
        <p>Loading hospital command center...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Top Hospital Command Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-2xl shadow-md ring-4 ring-blue-50">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{hospital?.hospital_name}</h1>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                Medical Facility
              </span>
            </div>
            <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" />
                Hotline: {hospital?.emergency_contact || hospital?.phone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400" />
                {hospital?.address}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/hospital/settings"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Settings className="h-4 w-4 text-slate-500" />
            Facility Settings
          </Link>
          <Link
            to="/hospital/map"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Compass className="h-4 w-4 text-blue-600" />
            Live Donor Radar
          </Link>
          <button
            type="button"
            onClick={() => handleQuickBroadcast()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Broadcast
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockGroups.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                Critical Stock Deficit: {lowStockGroups.map(([g]) => g).join(", ")}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                {lowStockGroups.length} blood type(s) have fewer than 3 refrigerated units on hand.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleQuickBroadcast(lowStockGroups[0][0])}
              className="rounded-xl bg-red-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs hover:bg-red-600 transition cursor-pointer"
            >
              Broadcast for {lowStockGroups[0][0]}
            </button>
            <Link
              to="/hospital/map"
              className="rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
            >
              Locate Donors →
            </Link>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Droplet}
          iconColor="text-red-500"
          value={totalUnits}
          label="Total Units in Stock"
          to="/hospital/blood-bank"
        />
        <StatCard
          icon={Activity}
          iconColor="text-amber-500"
          value={activeRequests.length}
          label="Active Broadcasts"
          to="/hospital/requests"
        />
        <StatCard
          icon={ShieldCheck}
          iconColor="text-emerald-600"
          value={fulfilledRequests.length}
          label="Fulfilled Needs"
          to="/hospital/requests"
        />
        <StatCard
          icon={Layers}
          iconColor="text-blue-600"
          value={8}
          label="Tracked Blood Types"
          to="/hospital/blood-bank"
        />
      </div>

      {/* Interactive Satellite Radar Highlight Banner */}
      <div className="rounded-3xl border border-slate-900 bg-slate-900 p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-300">
              Live Clinical Donor Radar
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
            Geospatial Proximity & ABO/Rh Matching Engine
          </h2>
          <p className="text-xs text-slate-300 max-w-lg">
            Track volunteer donors within 5 km to 100 km, filter by last donation date, and dispatch direct emergency pings.
          </p>
        </div>

        <div>
          <Link
            to="/hospital/map"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-black text-slate-900 shadow-md hover:bg-slate-100 transition cursor-pointer"
          >
            <Compass className="h-4 w-4 text-blue-600" />
            Launch Donor Map
            <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
          </Link>
        </div>
      </div>

      {/* Live Refrigerated Inventory Matrix */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Refrigerated Blood Bank Inventory ({totalUnits} Total Units)</CardTitle>
            <CardDescription>Direct unit counts stored in facility temperature-controlled storage</CardDescription>
          </div>
          <Link
            to="/hospital/blood-bank"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Manage Inventory →
          </Link>
        </CardHeader>
        <div className="pt-4">
          <BloodMatrixGrid
            stock={stockMap}
            onUpdate={handleStockUpdate}
            updatingGroup={updatingGroup}
          />
        </div>
      </Card>

      {/* Recent Emergency Broadcasts Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Active Hospital Broadcasts & Responses</CardTitle>
            <CardDescription>Emergency requirements posted by {hospital?.hospital_name}</CardDescription>
          </div>
          <Link
            to="/hospital/requests"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            All Broadcasts ({requests.length}) →
          </Link>
        </CardHeader>

        {requests.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No active blood requirements posted. Click "New Broadcast" to request units.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 pt-2">
            {requests.slice(0, 5).map((r) => {
              const isLocked = r.status === "fulfilled" || r.status === "completed";
              return (
                <div key={r.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <UrgencyBadge urgency={r.urgency} />
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">
                        {r.units_required} Units of <span className="text-red-600 font-black">{r.blood_group}</span>
                        {r.patient_name && <span className="ml-1 font-normal text-slate-500">({r.patient_name})</span>}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        Posted on {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                        <ShieldCheck className="h-3 w-3" />
                        {r.status === "fulfilled" ? "FULFILLED" : "COMPLETED"}
                      </span>
                    ) : (
                      <StatusBadge status={r.status} />
                    )}

                    <Link
                      to="/hospital/requests"
                      className="text-xs font-bold text-slate-600 hover:text-blue-600"
                    >
                      Pledges →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <CreateRequestModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        onSubmit={handleCreateBroadcast}
        initialBloodGroup={prefilledGroup}
      />
    </div>
  );
}
