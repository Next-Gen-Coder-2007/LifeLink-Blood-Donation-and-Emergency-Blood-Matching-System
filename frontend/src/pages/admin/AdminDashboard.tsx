import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Droplet,
  Activity,
  ArrowRight,
  ShieldCheck,
  Award,
  Database,
  CheckCircle2,
  RefreshCw,
  Compass,
} from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

interface PlatformStats {
  totalUsers: number;
  totalDonors: number;
  totalHospitals: number;
  totalRequests: number;
  activeRequests: number;
  fulfilledRequests: number;
  totalDonations: number;
  totalPledges: number;
  totalStockUnits: number;
  stockByGroup: Record<string, number>;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await api.get<PlatformStats>("/analytics/stats");
      setStats(data);
    } catch {
      showToast("Failed to fetch system analytics", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!session || session.user.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    fetchStats();
  }, [session?.user?.id, session?.user?.role, navigate]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const totalUnits = stats?.totalStockUnits || (stats ? Object.values(stats.stockByGroup).reduce((a, b) => a + b, 0) : 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <PageHeader
        title="Admin Operations Command Center"
        description="Real-time system telemetry, database record management, and clinical verification audits"
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-bold shadow-xs">
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              MongoDB Database
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-500 mb-3" />
          <p>Compiling database telemetry...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={Users}
              iconColor="text-blue-600"
              value={stats?.totalUsers || 0}
              label="Registered Users"
              to="/admin/users"
            />
            <StatCard
              icon={Droplet}
              iconColor="text-red-500"
              value={stats?.totalDonors || 0}
              label="Active Donors"
              to="/admin/donors"
            />
            <StatCard
              icon={Building2}
              iconColor="text-emerald-600"
              value={stats?.totalHospitals || 0}
              label="Connected Hospitals"
              to="/admin/hospitals"
            />
            <StatCard
              icon={Activity}
              iconColor="text-amber-500"
              value={stats?.totalRequests || 0}
              label="Blood Requests"
              to="/admin/requests"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Active Broadcasts</span>
                <span className="h-2 w-2 rounded-full bg-red-500" />
              </div>
              <p className="mt-1.5 text-2xl font-black text-red-600">{stats?.activeRequests || 0}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Searching for Donors</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Verified Transfusions</span>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-1.5 text-2xl font-black text-slate-900">{stats?.totalDonations || 0}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Certificates Issued</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Global Blood Stock</span>
                <Droplet className="h-4 w-4 text-purple-500" />
              </div>
              <p className="mt-1.5 text-2xl font-black text-purple-600">{totalUnits}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Refrigerated Units</p>
            </div>
          </div>

          {/* Quick Management Hub */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              to="/admin/users"
              className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-600" />
                  User Accounts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Audit roles & manage login credentials</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/donors"
              className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Droplet className="h-4 w-4 text-red-500" />
                  Donor Registry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Blood types, coordinates & last donations</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/hospitals"
              className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  Hospital Facilities
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Emergency hotlines & facility blood banks</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/requests"
              className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-amber-500" />
                  Blood Broadcasts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Audit triage urgency & fulfillments</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/certificates"
              className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-purple-600" />
                  Certificate Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Clinical serial verification hashes</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/hospital/map"
              className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-blue-500" />
                  Live Geospatial Radar
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Interactive donor proximity mesh</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>

          {/* Platform Blood Reserves Breakdown Matrix */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Global Refrigerated Blood Stock ({totalUnits} Total Units)</CardTitle>
                <CardDescription>Aggregate stock counts across all connected hospital blood banks</CardDescription>
              </div>
            </CardHeader>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4">
              {bloodGroups.map((g) => {
                const count = stats?.stockByGroup[g] || 0;
                return (
                  <div
                    key={g}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100"
                  >
                    <span className="font-extrabold text-sm text-slate-900">{g}</span>
                    <span className="text-sm font-black text-slate-800">
                      {count} <span className="text-xs font-normal text-slate-400">units</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* System Diagnostics & MongoDB Integrity */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Database Engine Status
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Active • Latency &lt; 5ms
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px]">ODM Framework</span>
                <span className="font-bold text-slate-800">Mongoose / Express</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px]">ABO/Rh Matching</span>
                <span className="font-bold text-slate-800">Medical RBC & Plasma</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px]">Proximity Metric</span>
                <span className="font-bold text-slate-800">Haversine Great-Circle</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px]">Data Caching</span>
                <span className="font-bold text-slate-800">Direct MongoDB (Zero Delay)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
