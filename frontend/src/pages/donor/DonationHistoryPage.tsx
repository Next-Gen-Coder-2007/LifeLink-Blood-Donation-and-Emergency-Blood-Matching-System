import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Award,
  Droplet,
  Heart,
  ShieldCheck,
  Clock,
  Building2,
  FileCheck2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { DonationCertificateModal } from "@/components/donor/DonationCertificateModal";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DonorImpactStats, DonationHistoryItem } from "@/types";

interface DonorProfile {
  id: string;
  user_id: string;
  blood_group: string;
  availability: boolean;
  last_donation_date?: string | null;
}

export function DonationHistoryPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [stats, setStats] = useState<DonorImpactStats | null>(null);
  const [availability, setAvailability] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<DonationHistoryItem | null>(null);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);

  const fetchHistory = async (profileId: string) => {
    try {
      const data = await api.get<DonorImpactStats>(`/donation-history/donor/${profileId}`);
      setStats(data);
      if (data.availability !== undefined) {
        setAvailability(Boolean(data.availability));
      }
    } catch {
      showToast("Unable to load donation history", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || session.user.role !== "donor") {
      navigate("/login");
      return;
    }

    const init = async () => {
      try {
        const profile = await api.get<DonorProfile>(`/donors/user/${session.user.id}`);
        if (profile) {
          setDonorProfile(profile);
          setAvailability(Boolean(profile.availability));
          fetchHistory(profile.id);
        }
      } catch {
        setLoading(false);
      }
    };

    init();
  }, [session?.user?.id, session?.user?.role, navigate]);

  const handleToggleAvailability = async () => {
    if (!donorProfile) return;
    setToggling(true);
    const newStatus = !availability;
    try {
      await api.put(`/donors/${donorProfile.id}`, { availability: newStatus });
      setAvailability(newStatus);
      showToast(`Your status has been updated to ${newStatus ? "Available" : "Unavailable"}`);
    } catch {
      showToast("Failed to update availability status", "error");
    } finally {
      setToggling(false);
    }
  };

  const openCertificate = (donation: DonationHistoryItem) => {
    setSelectedDonation(donation);
    setCertificateModalOpen(true);
  };

  const getTierColor = (tier: string) => {
    if (tier.includes("Platinum")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (tier.includes("Gold")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (tier.includes("Silver")) return "bg-slate-200 text-slate-800 border-slate-300";
    return "bg-orange-100 text-orange-800 border-orange-200";
  };

  const lastDonatedDate = stats?.last_donation_date || donorProfile?.last_donation_date;
  const daysAgo = stats?.days_since_last_donation;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/donor/dashboard"
        title="Donation History & Digital Certificates"
        description={`Verified clinical records and availability status for ${session?.user.name || "donor"}`}
      />

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-500 mb-3" />
          <p>Compiling verified donation records...</p>
        </div>
      ) : (
        <>
          {/* Impact Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Total Verified</span>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{stats?.total_donations || 0}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Donations Logged</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Units Donated</span>
                <Droplet className="h-4 w-4 text-red-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-red-600">{stats?.total_units || 0}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Refrigerated Units</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Lives Saved</span>
                <Heart className="h-4 w-4 text-rose-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900">{stats?.lives_saved || 0}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Estimated Impact</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Donor Badge</span>
                <Award className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2">
                <span className={`inline-block rounded-lg px-2.5 py-1 text-xs font-black border ${getTierColor(stats?.hero_tier || "")}`}>
                  {stats?.hero_tier || "New Lifesaver"}
                </span>
              </div>
            </div>
          </div>

          {/* Donor Availability & Last Donated Status Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shrink-0 ${
                  availability ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {availability ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Donor Status: {availability ? "Available for Emergency Calls" : "Currently Unavailable"}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      availability ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {availability ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lastDonatedDate
                      ? `Last donation was recorded on ${lastDonatedDate}${daysAgo !== null && daysAgo !== undefined ? ` (${daysAgo} days ago)` : ""}. You can toggle your availability anytime.`
                      : "First-time donor with no past donation records on file. You are set to receive broadcast alerts."}
                  </p>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleToggleAvailability}
                  disabled={toggling}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer ${
                    availability
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {toggling
                    ? "Updating..."
                    : availability
                    ? "Switch to Unavailable"
                    : "Switch to Available"}
                </button>
              </div>
            </div>
          </div>

          {/* Verified History Records Table */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Verified Donation Timeline</CardTitle>
                <CardDescription>Official clinical transfusions and certificates registered in LifeLink</CardDescription>
              </div>
            </CardHeader>

            {(!stats?.history || stats.history.length === 0) ? (
              <EmptyState
                icon={CalendarDays}
                title="No verified past donations yet"
                description="Once a hospital team completes a transfusion verification from your pledge, your verified certificate will appear here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Donation Date</th>
                      <th className="px-6 py-3.5">Medical Facility</th>
                      <th className="px-6 py-3.5">Units & Blood Group</th>
                      <th className="px-6 py-3.5">Certificate ID</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.history.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(record.donation_date).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-900">{record.hospital_name}</p>
                              {record.hospital_address && (
                                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                  {record.hospital_address}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 border border-red-200 px-2 py-0.5 font-black text-red-700">
                            <Droplet className="h-3 w-3" />
                            {record.units} Unit(s) • {record.blood_group}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-700">
                          {record.certificate_id}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openCertificate(record)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                          >
                            <FileCheck2 className="h-3.5 w-3.5 text-amber-600" />
                            View Certificate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Official Certificate Viewer Modal */}
      <DonationCertificateModal
        isOpen={certificateModalOpen}
        onClose={() => setCertificateModalOpen(false)}
        donation={selectedDonation}
      />
    </div>
  );
}
