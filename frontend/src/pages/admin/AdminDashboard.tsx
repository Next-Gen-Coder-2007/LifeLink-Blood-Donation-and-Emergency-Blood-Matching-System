import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Building2, Droplet, Activity, ArrowRight } from "lucide-react";
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
  stockByGroup: Record<string, number>;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || session.user.role !== "admin") {
      navigate("/admin/login");
      return;
    }

    api.get<PlatformStats>("/analytics/stats")
      .then(setStats)
      .catch(() => showToast("Failed to fetch analytics", "error"))
      .finally(() => setLoading(false));
  }, [session, navigate]);

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading system metrics...</div>;
  }

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const totalUnits = stats ? Object.values(stats.stockByGroup).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <PageHeader
        title="Admin Operations Center"
        description="System metrics, user directory, and database management"
        action={
          <span className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-bold">
            Database: MongoDB
          </span>
        }
      />

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
          label="Hospitals"
          to="/admin/hospitals"
        />
        <StatCard
          icon={Activity}
          iconColor="text-amber-500"
          value={stats?.totalRequests || 0}
          label="Total Blood Requests"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/admin/users"
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:bg-slate-50 transition"
        >
          <div>
            <h3 className="font-bold text-slate-900 text-sm">User Management</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage accounts & cascade deletion</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/donors"
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:bg-slate-50 transition"
        >
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Donor Directory</h3>
            <p className="text-xs text-slate-500 mt-0.5">Audit blood types & availability</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/hospitals"
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:bg-slate-50 transition"
        >
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Hospital Network</h3>
            <p className="text-xs text-slate-500 mt-0.5">Audit facilities & emergency lines</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Platform Blood Reserves ({totalUnits} Total Units)</CardTitle>
            <CardDescription>Aggregate stock counts across all connected hospital blood banks</CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4">
          {bloodGroups.map((g) => (
            <div key={g} className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="font-bold text-sm text-slate-900">{g}</span>
              <span className="text-sm font-extrabold text-slate-800">
                {stats?.stockByGroup[g] || 0} <span className="text-xs font-normal text-slate-400">units</span>
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
