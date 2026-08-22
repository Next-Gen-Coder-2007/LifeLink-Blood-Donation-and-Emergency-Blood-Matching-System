import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Droplet,
  Activity,
  Calendar,
  CheckCircle2,
  Award,
  Phone,
  ShieldCheck,
  Compass,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { AvailabilityToggle } from "@/components/donor/AvailabilityToggle";
import { DonorRequestCard, type DonorRequestItem } from "@/components/donor/DonorRequestCard";
import { PledgeDonationModal } from "@/components/donor/PledgeDonationModal";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DonationPledgeItem, DonorImpactStats } from "@/types";
import { calculateHaversineDistance, calculateTravelTimeMinutes } from "@/lib/distanceEngine";
import { evaluateBloodMatch, isBloodCompatible } from "@/lib/bloodMatchingEngine";

interface DonorData {
  id: string;
  user_id: string;
  blood_group: string;
  phone: string;
  latitude: number;
  longitude: number;
  availability: boolean;
  last_donation_date?: string;
}

export function DonorDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [donor, setDonor] = useState<DonorData | null>(null);
  const [matchingRequests, setMatchingRequests] = useState<DonorRequestItem[]>([]);
  const [activePledges, setActivePledges] = useState<DonationPledgeItem[]>([]);
  const [impactStats, setImpactStats] = useState<DonorImpactStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<DonorRequestItem | null>(null);
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false);

  const loadDonorData = async () => {
    if (!session?.user?.id) return;
    try {
      const myProfile = await api.get<DonorData>(`/donors/user/${session.user.id}`);

      if (myProfile) {
        setDonor(myProfile);
        const [allReqs, pledges, historyStats] = await Promise.all([
          api.get<DonorRequestItem[]>("/blood-requests").catch(() => []),
          api.get<DonationPledgeItem[]>(`/donation-pledges/donor/${myProfile.id}`).catch(() => []),
          api.get<DonorImpactStats>(`/donation-history/donor/${myProfile.id}`).catch(() => null),
        ]);

        const donorLat = myProfile.latitude || 40.7128;
        const donorLng = myProfile.longitude || -74.006;
        const donorGroup = myProfile.blood_group || "O+";

        const enriched = allReqs
          .filter((r) => r.status === "searching")
          .map((r) => {
            const hLat = r.hospital_latitude || 0;
            const hLng = r.hospital_longitude || 0;
            let distanceKm: number | null = null;
            let estimatedMins: number | null = null;

            if (donorLat !== 0 && donorLng !== 0 && hLat !== 0 && hLng !== 0) {
              distanceKm = calculateHaversineDistance(donorLat, donorLng, hLat, hLng);
              estimatedMins = calculateTravelTimeMinutes(distanceKm, "emergency");
            }

            const match = evaluateBloodMatch(donorGroup, r.blood_group);
            const compatible = isBloodCompatible(donorGroup, r.blood_group);

            return {
              ...r,
              distanceKm,
              estimatedMins,
              matchScore: match.score,
              matchTier: match.tier,
              matchLabel: match.label,
              badgeBg: match.badgeBg,
              badgeColor: match.badgeColor,
              badgeBorder: match.badgeBorder,
              isCompatible: compatible,
            };
          })
          .sort((a, b) => {
            // Compatible / Exact matches first
            if (Boolean(a.isCompatible) !== Boolean(b.isCompatible)) {
              return a.isCompatible ? -1 : 1;
            }
            // Higher match score first
            if ((b.matchScore || 0) !== (a.matchScore || 0)) {
              return (b.matchScore || 0) - (a.matchScore || 0);
            }
            // Urgency weighting
            const urgencyWeight: Record<string, number> = { emergency: 3, urgent: 2, normal: 1 };
            const uA = urgencyWeight[a.urgency] || 0;
            const uB = urgencyWeight[b.urgency] || 0;
            if (uB !== uA) return uB - uA;
            // Nearest distance first
            return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
          });

        setMatchingRequests(enriched);
        setActivePledges(pledges.filter((p) => p.status === "pledged" || p.status === "acknowledged"));
        setImpactStats(historyStats);

        // Dynamic donor location tracking
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = Number(pos.coords.latitude.toFixed(5));
              const lng = Number(pos.coords.longitude.toFixed(5));
              if (myProfile && (Math.abs(lat - (myProfile.latitude || 0)) > 0.001 || Math.abs(lng - (myProfile.longitude || 0)) > 0.001)) {
                api.put(`/donors/${myProfile.id}`, { latitude: lat, longitude: lng }).catch(() => {});
                setDonor((prev) => (prev ? { ...prev, latitude: lat, longitude: lng } : prev));
              }
            },
            () => {},
            { enableHighAccuracy: true, timeout: 5000 }
          );
        }
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load donor portal", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || session.user.role !== "donor") {
      navigate("/login");
      return;
    }
    loadDonorData();
  }, [session?.user?.id, session?.user?.role, navigate]);

  const toggleAvailability = async () => {
    if (!donor) return;
    try {
      const nextStatus = !donor.availability;
      await api.put(`/donors/${donor.id}`, { availability: nextStatus });
      setDonor({ ...donor, availability: nextStatus });
      showToast(`Status updated: ${nextStatus ? "Available for donations" : "Currently Offline"}`);
    } catch {
      showToast("Could not update availability status", "error");
    }
  };

  const handleOpenPledge = (req: DonorRequestItem) => {
    setSelectedRequest(req);
    setPledgeModalOpen(true);
  };

  const handlePledgeSubmit = async (data: { estimated_arrival: string; notes: string }) => {
    if (!donor || !selectedRequest || !session) return;
    try {
      await api.post("/donation-pledges", {
        request_id: selectedRequest.id,
        hospital_id: selectedRequest.hospital_id,
        donor_id: donor.id,
        donor_user_id: session.user.id,
        donor_name: session.user.name,
        donor_phone: donor.phone,
        blood_group: donor.blood_group,
        estimated_arrival: data.estimated_arrival,
        notes: data.notes,
      });
      showToast("Donation pledge registered! The hospital has been notified.");
      setPledgeModalOpen(false);
      loadDonorData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to record pledge", "error");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-500 mb-3" />
        <p>Loading donor operations center...</p>
      </div>
    );
  }

  const lastDonatedDate = impactStats?.last_donation_date || donor?.last_donation_date;
  const daysAgo = impactStats?.days_since_last_donation;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Top Donor Profile Command Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white font-black text-2xl shadow-md ring-4 ring-red-50">
            {donor?.blood_group || "O+"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{session?.user.name}</h1>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                Verified Donor
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span>{donor?.phone}</span>
              <span>•</span>
              <span>{session?.user.email}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">
                {lastDonatedDate
                  ? `Last donated: ${lastDonatedDate}${daysAgo !== null && daysAgo !== undefined ? ` (${daysAgo}d ago)` : ""}`
                  : "First-time registered donor"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AvailabilityToggle
            available={donor?.availability ?? true}
            onToggle={toggleAvailability}
          />
        </div>
      </div>

      {/* Active Pledges Alert Banner */}
      {activePledges.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                {activePledges.length} Active Donation Pledge in Progress
              </h3>
            </div>
            <Link to="/donor/requests" className="text-xs font-bold text-emerald-800 hover:underline">
              All Broadcasts →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activePledges.map((p) => (
              <div key={p.id} className="rounded-xl border border-emerald-200 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{p.hospital_name || "Medical Facility"}</span>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                    {p.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Blood Group</span>
                    <span className="font-bold text-red-600">{p.blood_group}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Arrival ETA</span>
                    <span className="font-bold text-slate-900">{p.estimated_arrival}</span>
                  </div>
                </div>
                {p.hospital_phone && (
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Direct Hotline:</span>
                    <a href={`tel:${p.hospital_phone}`} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                      <Phone className="h-3 w-3" /> {p.hospital_phone}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Activity}
          iconColor="text-red-500"
          value={matchingRequests.length}
          label="Matching Requests"
          to="/donor/requests"
        />
        <StatCard
          icon={Droplet}
          iconColor="text-blue-600"
          value={donor?.blood_group || "O+"}
          label="Blood Type"
          to="/donor/requests"
        />
        <StatCard
          icon={Calendar}
          iconColor="text-emerald-600"
          value={impactStats?.total_donations ? `${impactStats.total_donations} Completed` : "0 Logged"}
          label="Verified Transfusions"
          to="/donor/history"
        />
        <StatCard
          icon={Award}
          iconColor="text-amber-500"
          value={impactStats?.hero_tier || "New Hero"}
          label="Hero Badge Tier"
          to="/donor/history"
        />
      </div>

      {/* Quick Action Portals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          to="/donor/requests"
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-red-200 hover:bg-red-50/30 transition group"
        >
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-red-500" />
              <h3 className="font-extrabold text-slate-900 text-sm">Emergency Requests</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {matchingRequests.length} broadcasts match your blood type
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-red-600 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          to="/donor/history"
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-emerald-200 hover:bg-emerald-50/30 transition group"
        >
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Digital Certificates</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              View and download your official transfusion records
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          to="/hospital/map"
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-blue-200 hover:bg-blue-50/30 transition group"
        >
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-blue-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Public Hospital Radar</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Explore worldwide blood bank inventory on map
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Nearby Urgent Requests */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Emergency Blood Broadcasts</CardTitle>
            <CardDescription>
              Live hospital transfusion requirements prioritizing your verified blood type ({donor?.blood_group || "O+"})
            </CardDescription>
          </div>
          <Link
            to="/donor/requests"
            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
          >
            View All ({matchingRequests.length}) →
          </Link>
        </CardHeader>

        {matchingRequests.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No emergency broadcasts currently active"
            description="You will receive real-time notifications whenever local hospitals post requests matching your blood type."
          />
        ) : (
          <div className="mt-4 space-y-3">
            {matchingRequests.slice(0, 4).map((req) => (
              <DonorRequestCard
                key={req.id}
                request={req}
                isPledged={activePledges.some((p) => p.request_id === req.id)}
                onPledgeClick={handleOpenPledge}
              />
            ))}
          </div>
        )}
      </Card>

      <PledgeDonationModal
        isOpen={pledgeModalOpen}
        onClose={() => setPledgeModalOpen(false)}
        request={selectedRequest}
        onPledgeSubmit={handlePledgeSubmit}
      />
    </div>
  );
}
