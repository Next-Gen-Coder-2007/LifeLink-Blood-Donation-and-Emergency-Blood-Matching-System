import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { DataTable, type DataRow } from "@/components/admin/DataTable";

export type AdminManagementType = "users" | "donors" | "hospitals" | "requests" | "certificates";

export function AdminManagementPage({ type }: { type: AdminManagementType }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [items, setItems] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);

  const getEndpoint = () => {
    switch (type) {
      case "users":
        return "/users";
      case "donors":
        return "/donors";
      case "hospitals":
        return "/hospitals";
      case "requests":
        return "/blood-requests";
      case "certificates":
        return "/donation-history";
      default:
        return `/${type}`;
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.get<DataRow[]>(getEndpoint());
      setItems(data);
    } catch {
      showToast(`Failed to load ${type} records`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || session.user.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    loadData();
  }, [type, session, navigate]);

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}? Cascade actions may apply.`)) return;
    try {
      await api.delete(`${getEndpoint()}/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast(`${type.slice(0, -1)} record deleted successfully`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Deletion failed", "error");
    }
  };

  const getTitle = () => {
    switch (type) {
      case "users":
        return "User Accounts Management";
      case "donors":
        return "Registered Donors Directory";
      case "hospitals":
        return "Hospital Facilities Network";
      case "requests":
        return "Emergency Blood Broadcasts Audit";
      case "certificates":
        return "Verified Donation Certificates Ledger";
      default:
        return `${type} Management`;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/admin/dashboard"
        title={getTitle()}
        description={`Managing ${items.length} live records in MongoDB database`}
        action={
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            Refresh
          </button>
        }
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{type.toUpperCase()} Record Table</CardTitle>
            <CardDescription>Search, inspect, and manage system database records</CardDescription>
          </div>
        </CardHeader>

        <div className="pt-4">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-500">Loading {type}...</div>
          ) : (
            <DataTable
              data={items}
              onDelete={handleDelete}
              emptyText={`No ${type} found in database.`}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
