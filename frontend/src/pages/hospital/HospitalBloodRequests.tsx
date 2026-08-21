import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Clock, Activity } from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { CreateRequestModal } from "@/components/hospital/CreateRequestModal";
import { UrgencyBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface BloodRequestItem {
  id: string;
  hospital_id: string;
  blood_group: string;
  units_required: number;
  urgency: "normal" | "urgent" | "emergency";
  patient_name?: string;
  required_by?: string;
  status: "searching" | "fulfilled" | "cancelled" | "completed";
  created_at: string;
}

export function HospitalBloodRequests() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [hospitalId, setHospitalId] = useState("");
  const [requests, setRequests] = useState<BloodRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadRequests = async (hId: string) => {
    try {
      const data = await api.get<BloodRequestItem[]>(`/blood-requests/hospital/${hId}`);
      setRequests(data);
    } catch {
      showToast("Unable to load requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || session.user.role !== "hospital") {
      navigate("/login");
      return;
    }

    const init = async () => {
      try {
        let current: { id: string; user_id: string } | null = null;
        try {
          current = await api.get<{ id: string; user_id: string }>(`/hospitals/user/${session.user.id}`);
        } catch {
          const hospitals = await api.get<{ id: string; user_id: string }[]>("/hospitals");
          current = hospitals.find((h) => String(h.user_id) === String(session.user.id)) || null;
        }

        if (current) {
          setHospitalId(current.id);
          loadRequests(current.id);
        }
      } catch {
        setLoading(false);
      }
    };

    init();
  }, [session, navigate]);

  const handleCreate = async (formData: {
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
      showToast("Emergency blood request broadcasted!");
      loadRequests(hospitalId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to broadcast request", "error");
      throw err;
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/blood-requests/${id}`, { status });
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as BloodRequestItem["status"] } : r)));
      showToast(`Status updated to ${status}`);
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    try {
      await api.delete(`/blood-requests/${id}`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      showToast("Request removed");
    } catch {
      showToast("Failed to delete request", "error");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/hospital/dashboard"
        title="Hospital Blood Requests"
        description="Track and triage emergency broadcasts to local donors"
        action={
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition"
          >
            <Plus className="h-4 w-4" />
            New Broadcast
          </button>
        }
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Active Broadcast Log</CardTitle>
            <CardDescription>Live status of all blood units requested by this facility</CardDescription>
          </div>
        </CardHeader>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No blood requests posted"
            description="Click 'New Broadcast' to dispatch an urgent or emergency blood requirement."
          />
        ) : (
          <div className="space-y-3 pt-4">
            {requests.map((r) => (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <UrgencyBadge urgency={r.urgency} />
                    <span className="font-extrabold text-sm text-slate-900">
                      {r.units_required} Units of <span className="text-red-600">{r.blood_group}</span>
                    </span>
                    {r.patient_name && <span className="text-xs text-slate-500">({r.patient_name})</span>}
                  </div>
                  <p className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="h-3 w-3" />
                    Issued on {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="searching">Searching</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Request"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <CreateRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
