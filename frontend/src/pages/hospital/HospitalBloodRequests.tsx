import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Clock, Activity, HeartHandshake, Phone, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { CreateRequestModal } from "@/components/hospital/CreateRequestModal";
import { VerifyDonationModal } from "@/components/hospital/VerifyDonationModal";
import { UrgencyBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DonationPledgeItem } from "@/types";

interface BloodRequestItem {
  id: string;
  hospital_id: string;
  blood_group: string;
  units_required: number;
  initial_units_required?: number;
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
  const [pledgesMap, setPledgesMap] = useState<Record<string, DonationPledgeItem[]>>({});
  const [expandedPledges, setExpandedPledges] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedPledge, setSelectedPledge] = useState<DonationPledgeItem | null>(null);

  const loadRequests = async (hId: string) => {
    try {
      const [data, allPledges] = await Promise.all([
        api.get<BloodRequestItem[]>(`/blood-requests/hospital/${hId}`),
        api.get<DonationPledgeItem[]>(`/donation-pledges/hospital/${hId}`).catch(() => []),
      ]);
      setRequests(data);

      const pledgesEntries: Record<string, DonationPledgeItem[]> = {};
      data.forEach((r) => {
        pledgesEntries[r.id] = [];
      });
      allPledges.forEach((p) => {
        if (p.request_id) {
          if (!pledgesEntries[p.request_id]) pledgesEntries[p.request_id] = [];
          pledgesEntries[p.request_id].push(p);
        }
      });
      setPledgesMap(pledgesEntries);
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
        const current = await api.get<{ id: string; user_id: string }>(`/hospitals/user/${session.user.id}`);
        if (current) {
          setHospitalId(current.id);
          loadRequests(current.id);
        }
      } catch {
        setLoading(false);
      }
    };

    init();
  }, [session?.user?.id, session?.user?.role, navigate]);

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
      showToast("Emergency blood request broadcasted to matching donors!");
      loadRequests(hospitalId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to broadcast request", "error");
      throw err;
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const target = requests.find((r) => r.id === id);
    if (target && (target.status === "fulfilled" || target.status === "completed")) {
      showToast("Fulfilled or completed requests cannot be reverted", "error");
      return;
    }

    try {
      await api.put(`/blood-requests/${id}`, { status });
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as BloodRequestItem["status"] } : r)));
      showToast(`Status updated to ${status}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update status", "error");
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

  const togglePledges = (reqId: string) => {
    setExpandedPledges((prev) => ({ ...prev, [reqId]: !prev[reqId] }));
  };

  const handleOpenVerify = (pledge: DonationPledgeItem) => {
    setSelectedPledge(pledge);
    setVerifyModalOpen(true);
  };

  const handleVerifyDonation = async (pledgeId: string, units: number, remarks: string) => {
    try {
      const res = await api.post<{ certificate_id: string }>(`/donation-pledges/${pledgeId}/complete`, {
        units,
        remarks,
      });
      showToast(`Donation verified! Certificate #${res.certificate_id} issued and stock updated.`);
      if (hospitalId) loadRequests(hospitalId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to verify donation", "error");
      throw err;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/hospital/dashboard"
        title="Hospital Blood Requests & Donor Responses"
        description="Track emergency broadcasts and verify incoming donor pledges"
        action={
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition cursor-pointer"
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
            <CardDescription>Live status of blood requirements and responding donors</CardDescription>
          </div>
        </CardHeader>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-500 mb-3" />
            <p>Loading broadcasts and donor pledges...</p>
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No blood requests posted"
            description="Click 'New Broadcast' to dispatch an urgent or emergency blood requirement to local donors."
          />
        ) : (
          <div className="space-y-4 pt-4">
            {requests.map((r) => {
              const pledges = pledgesMap[r.id] || [];
              const activePledges = pledges.filter((p) => p.status === "pledged" || p.status === "acknowledged");
              const isExpanded = expandedPledges[r.id];
              const isTerminal = r.status === "fulfilled" || r.status === "completed";

              return (
                <div key={r.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <UrgencyBadge urgency={r.urgency} />
                        <span className="font-extrabold text-sm text-slate-900">
                          {isTerminal
                            ? `Fulfilled (${r.initial_units_required || r.units_required || 1} Units Satisfied) • `
                            : `${r.units_required} Units of `}
                          <span className="text-red-600">{r.blood_group}</span>
                        </span>
                        {r.patient_name && <span className="text-xs text-slate-500">({r.patient_name})</span>}
                      </div>
                      <p className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        Issued on {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {isTerminal ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {r.status === "fulfilled" ? "Fulfilled" : "Completed"}
                        </span>
                      ) : (
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
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete Request"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Pledges Bar & Expand Toggle */}
                  <div className="border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => togglePledges(r.id)}
                      className="w-full flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <HeartHandshake className="h-4 w-4 text-red-500" />
                        <span>
                          {pledges.length > 0
                            ? `${pledges.length} Donor Pledge(s) (${activePledges.length} Active)`
                            : "No donor pledges yet for this broadcast"}
                        </span>
                      </span>
                      {pledges.length > 0 && (
                        <span className="flex items-center gap-1 text-slate-400">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </span>
                      )}
                    </button>

                    {/* Expandable Pledged Donors List */}
                    {isExpanded && pledges.length > 0 && (
                      <div className="mt-3 divide-y divide-slate-100 bg-white rounded-xl border border-slate-200/60 p-2">
                        {pledges.map((p) => (
                          <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">{p.donor_name}</span>
                                <span className="font-extrabold text-[11px] text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                                  {p.blood_group}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  p.status === "completed"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : p.status === "cancelled"
                                    ? "bg-slate-100 text-slate-500"
                                    : "bg-blue-100 text-blue-800 animate-pulse"
                                }`}>
                                  {p.status.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                ETA: <span className="font-bold text-slate-700">{p.estimated_arrival}</span>
                                {p.notes && <span className="ml-2 italic text-slate-400">"{p.notes}"</span>}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:${p.donor_phone}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                              >
                                <Phone className="h-3 w-3 text-blue-600" />
                                Call Donor
                              </a>

                              {p.status !== "completed" && p.status !== "cancelled" && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenVerify(p)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition cursor-pointer"
                                >
                                  <ShieldCheck className="h-3 w-3" />
                                  Verify & Record Donation
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <CreateRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />

      <VerifyDonationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        pledge={selectedPledge}
        onVerifySubmit={handleVerifyDonation}
      />
    </div>
  );
}
