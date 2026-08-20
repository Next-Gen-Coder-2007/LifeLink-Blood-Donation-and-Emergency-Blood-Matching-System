import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Droplet, Plus, Activity, Phone, MapPin, Layers, Clock } from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { BloodMatrixGrid } from "@/components/hospital/BloodMatrixGrid";
import { UrgencyBadge, StatusBadge } from "@/components/ui/Badge";

interface HospitalData {
  id: string;
  user_id: string;
  hospital_name: string;
  phone: string;
  emergency_contact: string;
  address: string;
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
  created_at: string;
}

export function HospitalDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [hospital, setHospital] = useState<HospitalData | null>(null);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || session.user.role !== "hospital") {
      navigate("/login");
      return;
    }

    const loadHospital = async () => {
      try {
        const hospitals = await api.get<HospitalData[]>("/hospitals");
        const current = hospitals.find((h) => String(h.user_id) === String(session.user.id));
        if (current) {
          setHospital(current);
          const [inventory, reqs] = await Promise.all([
            api.get<BloodStock[]>(`/hospitals/${current.id}/blood-bank`),
            api.get<RequestItem[]>(`/blood-requests/hospital/${current.id}`),
          ]);
          const map: Record<string, number> = {};
          inventory.forEach((i) => { map[i.blood_group] = i.units; });
          setStockMap(map);
          setRequests(reqs);
        }
      } catch {
        showToast("Unable to load hospital dashboard", "error");
      } finally {
        setLoading(false);
      }
    };

    loadHospital();
  }, [session, navigate]);

  const totalUnits = Object.values(stockMap).reduce((sum, units) => sum + units, 0);
  const activeRequests = requests.filter((r) => r.status === "searching");

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading hospital command center...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-bold text-xl shadow-xs">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{hospital?.hospital_name}</h1>
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">Hospital</span>
            </div>
            <p className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Phone className="h-3 w-3" /> {hospital?.emergency_contact || hospital?.phone}
              <span>•</span>
              <MapPin className="h-3 w-3" /> {hospital?.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/hospital/requests"
            className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition"
          >
            <Plus className="h-4 w-4" />
            New Broadcast
          </Link>
          <Link
            to="/hospital/blood-bank"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            <Layers className="h-4 w-4 text-blue-600" />
            Manage Stock
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
          label="Searching Requests"
          to="/hospital/requests"
        />
        <StatCard
          icon={Layers}
          iconColor="text-blue-500"
          value={8}
          label="Blood Groups Tracked"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Live Blood Inventory Matrix</CardTitle>
            <CardDescription>Current available units stored in facility refrigeration</CardDescription>
          </div>
          <Link to="/hospital/blood-bank" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            Edit Inventory →
          </Link>
        </CardHeader>
        <div className="pt-4">
          <BloodMatrixGrid
            stock={stockMap}
            onUpdate={() => {}}
            updatingGroup={null}
            readonly
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Blood Broadcasts</CardTitle>
            <CardDescription>Emergency and standard requests posted by this hospital</CardDescription>
          </div>
          <Link to="/hospital/requests" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View All ({requests.length}) →
          </Link>
        </CardHeader>

        {requests.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No requests have been broadcast yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 pt-2">
            {requests.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <UrgencyBadge urgency={r.urgency} />
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {r.units_required} Units of <span className="text-red-600 font-extrabold">{r.blood_group}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
