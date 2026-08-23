import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ThermometerSnowflake,
  ShieldCheck,
  AlertTriangle,
  Droplet,
  RefreshCw,
  Search,
  Plus,
} from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { BloodMatrixGrid } from "@/components/hospital/BloodMatrixGrid";
import { CreateRequestModal } from "@/components/hospital/CreateRequestModal";

interface BloodStock {
  blood_group: string;
  units: number;
}

export function HospitalBloodBank() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [hospitalId, setHospitalId] = useState("");
  const [stock, setStock] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingGroup, setUpdatingGroup] = useState<string | null>(null);

  // Broadcast Modal State
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastTargetGroup, setBroadcastTargetGroup] = useState<string | undefined>(undefined);

  // Filter State
  const [filterMode, setFilterMode] = useState<"all" | "rh_negative" | "rh_positive" | "deficit">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadInventory = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      if (!session?.user?.id) return;
      const current = await api.get<{ id: string; user_id: string }>(`/hospitals/user/${session.user.id}`);
      if (current) {
        setHospitalId(current.id);
        const res = await api.get<BloodStock[]>(`/hospitals/${current.id}/blood-bank`);
        const map: Record<string, number> = {};
        res.forEach((item) => {
          map[item.blood_group] = item.units;
        });
        setStock(map);
        if (isManualRefresh) showToast("Inventory telemetry refreshed");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load inventory", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!session || session.user.role !== "hospital") {
      navigate("/login");
      return;
    }
    loadInventory();
  }, [session?.user?.id, session?.user?.role, navigate]);

  const updateUnits = async (group: string, newCount: number) => {
    if (newCount < 0 || !hospitalId) return;
    setUpdatingGroup(group);
    try {
      await api.put(`/hospitals/${hospitalId}/blood-bank`, {
        blood_group: group,
        units: newCount,
      });
      setStock((prev) => ({ ...prev, [group]: newCount }));
      showToast(`${group} inventory updated to ${newCount} units`);
    } catch {
      showToast(`Failed to update ${group}`, "error");
    } finally {
      setUpdatingGroup(null);
    }
  };

  const handleBroadcastNeed = (group: string) => {
    setBroadcastTargetGroup(group);
    setBroadcastModalOpen(true);
  };

  const handleCreateBroadcast = async (formData: {
    blood_group: string;
    units_required: number;
    urgency: "normal" | "urgent" | "emergency";
    patient_name: string;
  }) => {
    if (!hospitalId) return;
    try {
      await api.post("/blood-requests", {
        hospital_id: hospitalId,
        blood_group: formData.blood_group,
        units_required: Number(formData.units_required),
        urgency: formData.urgency,
        patient_name: formData.patient_name || null,
      });
      showToast(`Emergency broadcast dispatched for ${formData.blood_group}!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to broadcast request", "error");
      throw err;
    }
  };

  const totalUnits = Object.values(stock).reduce((a, b) => a + b, 0);
  const deficitTypes = Object.entries(stock).filter(([, u]) => u < 3);
  const optimalTypes = Object.entries(stock).filter(([, u]) => u >= 3);

  // Filtered stock object
  const filteredStock = Object.entries(stock).reduce((acc, [group, count]) => {
    const isNeg = group.includes("-");
    const isPos = group.includes("+");
    const isDef = count < 3;

    if (filterMode === "rh_negative" && !isNeg) return acc;
    if (filterMode === "rh_positive" && !isPos) return acc;
    if (filterMode === "deficit" && !isDef) return acc;

    if (searchQuery.trim()) {
      if (!group.toLowerCase().includes(searchQuery.toLowerCase().trim())) return acc;
    }

    acc[group] = count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/hospital/dashboard"
        title="Clinical Blood Bank & Cold Storage"
        description="Real-time 8-blood group inventory telemetry, cold-chain monitoring, and unit replenishment"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadInventory(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-red-600" : ""}`} />
              Sync Sensors
            </button>
            <button
              type="button"
              onClick={() => handleBroadcastNeed("O-")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Broadcast
            </button>
          </div>
        }
      />

      {/* Clinical Telemetry Dashboard Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Reserves</span>
            <Droplet className="h-4 w-4 text-red-500" />
          </div>
          <p className="mt-1.5 text-2xl font-black text-slate-900 tracking-tight">
            {totalUnits} <span className="text-xs font-semibold text-slate-400">units</span>
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Across 8 Standard Groups</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Cold Chain Monitor</span>
            <ThermometerSnowflake className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-1.5 text-2xl font-black text-emerald-600 tracking-tight">
            3.8°C <span className="text-xs font-semibold text-emerald-700">Norm</span>
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">ISO 15189 Cold Stored</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Optimal Stock Types</span>
            <ShieldCheck className="h-4 w-4 text-slate-700" />
          </div>
          <p className="mt-1.5 text-2xl font-black text-slate-900 tracking-tight">
            {optimalTypes.length} <span className="text-xs font-semibold text-slate-400">/ 8</span>
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Safety Reserve Satisfied</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Deficit Types</span>
            <AlertTriangle className={`h-4 w-4 ${deficitTypes.length > 0 ? "text-amber-500" : "text-slate-400"}`} />
          </div>
          <p className={`mt-1.5 text-2xl font-black tracking-tight ${deficitTypes.length > 0 ? "text-amber-600" : "text-slate-900"}`}>
            {deficitTypes.length} <span className="text-xs font-semibold text-slate-400">types</span>
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Fewer Than 3 Units</p>
        </div>
      </div>

      {/* Main Stock Card with Filter Controls */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Refrigeration Stock Inventory Matrix</CardTitle>
            <CardDescription>Live telemetry and direct stepper unit controls for whole blood and packed cells</CardDescription>
          </div>

          {/* Filter Pills and Search */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <div className="flex items-center rounded-xl bg-slate-100 p-1">
              {[
                { id: "all", label: "All (8)" },
                { id: "rh_negative", label: "Rh- Negative" },
                { id: "rh_positive", label: "Rh+ Positive" },
                { id: "deficit", label: `Deficit (${deficitTypes.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id as typeof filterMode)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    filterMode === tab.id
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-36">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Find group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-2.5 py-1 text-xs text-slate-800 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <div className="py-24 text-center text-xs text-slate-500">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-500 mb-3" />
            <p>Syncing hospital refrigeration telemetry...</p>
          </div>
        ) : (
          <div className="pt-2">
            <BloodMatrixGrid
              stock={filteredStock}
              onUpdate={updateUnits}
              updatingGroup={updatingGroup}
              onBroadcastNeed={handleBroadcastNeed}
            />
          </div>
        )}
      </Card>

      <CreateRequestModal
        isOpen={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        onSubmit={handleCreateBroadcast}
        initialBloodGroup={broadcastTargetGroup}
      />
    </div>
  );
}
