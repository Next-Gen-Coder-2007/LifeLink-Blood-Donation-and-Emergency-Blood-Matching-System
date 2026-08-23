import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Droplet,
  Plus,
  Activity,
  Phone,
  MapPin,
  Clock,
  Compass,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  UserCheck,
  Layers,
  ThermometerSnowflake,
  ExternalLink,
  Users,
} from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { BloodMatrixGrid } from "@/components/hospital/BloodMatrixGrid";
import { CreateRequestModal } from "@/components/hospital/CreateRequestModal";
import { VerifyDonationModal } from "@/components/hospital/VerifyDonationModal";
import { UrgencyBadge, StatusBadge } from "@/components/ui/Badge";
import type { DonationPledgeItem } from "@/types";

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
  initial_units_required?: number;
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
  const [pledges, setPledges] = useState<DonationPledgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [prefilledGroup, setPrefilledGroup] = useState<string | undefined>(undefined);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedPledge, setSelectedPledge] = useState<DonationPledgeItem | null>(null);

  const loadHospital = async () => {
    if (!session?.user?.id) return;
    try {
      const current = await api.get<HospitalData>(`/hospitals/user/${session.user.id}`);
      if (current) {
        setHospital(current);
        const [inventory, reqs, pledgeList] = await Promise.all([
          api.get<BloodStock[]>(`/hospitals/${current.id}/blood-bank`),
          api.get<RequestItem[]>(`/blood-requests/hospital/${current.id}`),
          api.get<DonationPledgeItem[]>(`/donation-pledges/hospital/${current.id}`).catch(() => []),
        ]);
        const map: Record<string, number> = {};
        inventory.forEach((i) => {
          map[i.blood_group] = i.units;
        });
        setStockMap(map);
        setRequests(reqs);
        setPledges(pledgeList);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to load hospital dashboard", "error");
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
  }, [session?.user?.id, session?.user?.role, navigate]);

  const totalUnits = Object.values(stockMap).reduce((sum, units) => sum + units, 0);
  const activeRequests = requests.filter((r) => r.status === "searching");
  const fulfilledRequests = requests.filter((r) => r.status === "fulfilled" || r.status === "completed");
  const activePledges = pledges.filter((p) => p.status === "pledged" || p.status === "acknowledged");

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

  const handleAcknowledgePledge = async (pledgeId: string) => {
    try {
      await api.put(`/donation-pledges/${pledgeId}`, { status: "acknowledged" });
      showToast("Pledge arrival acknowledged");
      loadHospital();
    } catch {
      showToast("Failed to acknowledge pledge", "error");
    }
  };

  const handleOpenVerifyModal = (pledge: DonationPledgeItem) => {
    setSelectedPledge(pledge);
    setVerifyModalOpen(true);
  };

  const handleVerifyDonationSubmit = async (pledgeId: string, units: number, remarks: string) => {
    try {
      await api.post(`/donation-pledges/${pledgeId}/verify`, {
        units_collected: units,
        remarks,
      });
      showToast(`Donation verified! ${units} unit(s) added to stock.`);
      loadHospital();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Verification failed", "error");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="py-28 text-center text-xs text-slate-500">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-600 mb-3" />
        <p className="font-semibold text-slate-600">Loading Clinical Station...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Top Clinical Station Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Clinical Medical Center
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {hospital?.hospital_name}
          </h1>
          <p className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Phone className="h-3.5 w-3.5 text-red-600" />
              Hotline: {hospital?.emergency_contact || hospital?.phone}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              {hospital?.address}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/hospital/map"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <Compass className="h-4 w-4 text-red-600" />
            Donor Radar
          </Link>
          <Link
            to="/hospital/blood-bank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <Layers className="h-4 w-4 text-slate-500" />
            Blood Bank
          </Link>
          <button
            type="button"
            onClick={() => handleQuickBroadcast()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Broadcast
          </button>
        </div>
      </div>

      {/* Main Clinical Station Workspace Layout (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): KPIs, Stock Deficit, Blood Matrix, Recent Requests */}
        <div className="lg:col-span-8 space-y-6">
          {/* Integrated Telemetry KPI Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-slate-100 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Stored Units</span>
                <Droplet className="h-4 w-4 text-red-600" />
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">{totalUnits}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">8 Blood Groups</p>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Active Needs</span>
                <Activity className="h-4 w-4 text-red-600" />
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">{activeRequests.length}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Broadcasting</p>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">En Route Pledges</span>
                <HeartHandshake className="h-4 w-4 text-red-600" />
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">{activePledges.length}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Incoming Donors</p>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Fulfilled Cases</span>
                <ShieldCheck className="h-4 w-4 text-slate-700" />
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">{fulfilledRequests.length}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Certificates Issued</p>
            </div>
          </div>

          {/* Deficit Alert Notice (Minimal Crimson Accent) */}
          {lowStockGroups.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-red-950">
                    Stock Deficit: {lowStockGroups.map(([g]) => g).join(", ")}
                  </p>
                  <p className="text-[11px] text-red-700 mt-0.5">
                    {lowStockGroups.length} blood type(s) have fewer than 3 refrigerated units.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleQuickBroadcast(lowStockGroups[0][0])}
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer shrink-0 shadow-2xs"
              >
                Broadcast for {lowStockGroups[0][0]}
              </button>
            </div>
          )}

          {/* Refrigerated Blood Bank Telemetry Matrix */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Refrigerated Blood Bank Telemetry
                </h2>
                <p className="text-xs text-slate-500">
                  {totalUnits} units stored across 8 ABO/Rh blood groups
                </p>
              </div>
              <Link
                to="/hospital/blood-bank"
                className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
              >
                Manage Stock →
              </Link>
            </div>

            <BloodMatrixGrid
              stock={stockMap}
              readonly={true}
              onBroadcastNeed={handleQuickBroadcast}
            />
          </div>

          {/* Active Emergency Broadcasts Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Hospital Emergency Broadcasts
                </h2>
                <p className="text-xs text-slate-500">
                  Recent blood transfusion requirements and matching status
                </p>
              </div>
              <Link
                to="/hospital/requests"
                className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
              >
                All Requests ({requests.length}) →
              </Link>
            </div>

            {requests.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                No active broadcasts posted. Click "New Broadcast" to request blood units.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 pt-1">
                {requests.slice(0, 4).map((r) => {
                  const isLocked = r.status === "fulfilled" || r.status === "completed";
                  return (
                    <div key={r.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <UrgencyBadge urgency={r.urgency} />
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">
                            {isLocked
                              ? `Fulfilled (${r.initial_units_required || r.units_required || 1} Units) • `
                              : `${r.units_required} Units of `}
                            <span className="text-red-600 font-black">{r.blood_group}</span>
                            {r.patient_name && <span className="ml-1 font-normal text-slate-500">({r.patient_name})</span>}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            <ShieldCheck className="h-3 w-3 text-slate-500" />
                            FULFILLED
                          </span>
                        ) : (
                          <StatusBadge status={r.status} />
                        )}
                        <Link
                          to="/hospital/requests"
                          className="text-xs font-bold text-slate-600 hover:text-red-600"
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Live Donor Radar Card & Incoming Pledges */}
        <div className="lg:col-span-4 space-y-6">
          {/* Geospatial Donor Radar Widget (Clean Light Design) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-red-600" />
                Live Donor Radar
              </span>
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Scan nearby registered donors within 5 km to 100 km radius, verify compatibility, and send emergency transfusion alerts.
            </p>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                Active Local Donors
              </span>
              <span className="font-black text-slate-900">100 Donors</span>
            </div>

            <Link
              to="/hospital/map"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition cursor-pointer"
            >
              Launch Donor Map
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Incoming Donor Pledges Triage */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <HeartHandshake className="h-4 w-4 text-red-600" />
                Incoming Donor Pledges ({activePledges.length})
              </h3>
              <Link to="/hospital/requests" className="text-[11px] font-bold text-red-600 hover:underline">
                View All
              </Link>
            </div>

            {activePledges.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active donors currently en route to your facility.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activePledges.slice(0, 3).map((p) => (
                  <div key={p.id} className="py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white text-xs font-black">
                          {p.blood_group}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{p.donor_name}</p>
                          <p className="text-[10px] font-semibold text-slate-400">ETA: {p.estimated_arrival}</p>
                        </div>
                      </div>
                      <a
                        href={`tel:${p.donor_phone}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-700 hover:bg-slate-100"
                        title="Call Donor"
                      >
                        <Phone className="h-3.5 w-3.5 text-red-600" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.status === "pledged" && (
                        <button
                          type="button"
                          onClick={() => handleAcknowledgePledge(p.id)}
                          className="flex-1 rounded-lg border border-slate-200 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenVerifyModal(p)}
                        className="flex-1 rounded-lg bg-red-600 py-1 text-[11px] font-bold text-white hover:bg-red-700 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                      >
                        <UserCheck className="h-3 w-3" />
                        Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Facility Standard Spec Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-2.5 text-xs text-slate-500">
            <span className="font-extrabold text-slate-900 block text-xs">
              Facility Information & Protocols
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cold Chain Protocol</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <ThermometerSnowflake className="h-3 w-3 text-red-600" />
                  3.8°C Monitored
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Blood Bank Standard</span>
                <span className="font-semibold text-slate-800">ISO 15189 Calibrated</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Profile Settings</span>
                <Link to="/hospital/settings" className="font-bold text-red-600 hover:underline inline-flex items-center gap-0.5">
                  Edit Profile <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateRequestModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        onSubmit={handleCreateBroadcast}
        initialBloodGroup={prefilledGroup}
      />

      {selectedPledge && (
        <VerifyDonationModal
          isOpen={verifyModalOpen}
          onClose={() => {
            setVerifyModalOpen(false);
            setSelectedPledge(null);
          }}
          pledge={selectedPledge}
          onVerifySubmit={handleVerifyDonationSubmit}
        />
      )}
    </div>
  );
}
