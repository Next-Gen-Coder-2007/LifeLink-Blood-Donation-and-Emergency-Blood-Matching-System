import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { DataTable, type DataRow } from "@/components/admin/DataTable";

export function AdminManagementPage({ type }: { type: "users" | "donors" | "hospitals" }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [items, setItems] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.get<DataRow[]>(`/${type}`);
      setItems(data);
    } catch {
      showToast(`Failed to load ${type}`, "error");
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
    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}? Cascade deletions will apply.`)) return;
    try {
      await api.delete(`/${type}/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast(`${type.slice(0, -1)} deleted successfully`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Deletion failed", "error");
    }
  };

  const getTitle = () => {
    if (type === "users") return "User Accounts Management";
    if (type === "donors") return "Registered Donors Directory";
    return "Hospital Network Directory";
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/admin/dashboard"
        title={getTitle()}
        description={`Managing ${items.length} records in MongoDB database`}
        action={
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{type.toUpperCase()} Record Table</CardTitle>
            <CardDescription>Search, audit, and manage active system records</CardDescription>
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
