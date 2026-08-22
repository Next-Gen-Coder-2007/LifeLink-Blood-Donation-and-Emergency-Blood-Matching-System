import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Droplet,
  Compass,
  Sparkles,
  Search,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { DonorRequestCard, type DonorRequestItem } from "@/components/donor/DonorRequestCard";
import { DonorRouteMap } from "@/components/donor/DonorRouteMap";
import { PledgeDonationModal } from "@/components/donor/PledgeDonationModal";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DonationPledgeItem } from "@/types";
import {
  BLOOD_GROUPS,
  evaluateBloodMatch,
  isBloodCompatible,
} from "@/lib/bloodMatchingEngine";
import {
  calculateHaversineDistance,
  calculateTravelTimeMinutes,
} from "@/lib/distanceEngine";

interface DonorProfile {
  id: string;
  user_id: string;
  blood_group: string;
  phone: string;
  latitude: number;
  longitude: number;
}

const RADIUS_OPTIONS = [
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
  { label: "Any Distance", value: 0 },
];

export function DonorBloodRequests() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [requests, setRequests] = useState<DonorRequestItem[]>([]);
  const [pledges, setPledges] = useState<DonationPledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [filterMode, setFilterMode] = useState<"compatible" | "exact" | "urgent" | "all">("compatible");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("ALL");
  const [radiusFilter, setRadiusFilter] = useState<number>(0); // 0 = Any/Worldwide by default
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<DonorRequestItem | null>(null);
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false);

  const fetchRequests = async (profileId?: string) => {
    try {
      const [resRequests, resPledges] = await Promise.all([
        api.get<DonorRequestItem[]>("/blood-requests"),
        profileId ? api.get<DonationPledgeItem[]>(`/donation-pledges/donor/${profileId}`).catch(() => []) : Promise.resolve([]),
      ]);

      setRequests(resRequests.filter((r) => r.status === "searching"));
      setPledges(resPledges);
    } catch {
      showToast("Unable to load matching requests", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadDonorAndRequests = async () => {
    try {
      let profile: DonorProfile | null = null;
      if (session?.user?.id) {
        try {
          profile = await api.get<DonorProfile>(`/donors/user/${session.user.id}`);
        } catch {
          profile = null;
        }
      }

      if (profile) {
        setDonorProfile(profile);
        fetchRequests(profile.id);

        // Update GPS dynamically
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = Number(pos.coords.latitude.toFixed(5));
              const lng = Number(pos.coords.longitude.toFixed(5));
              if (
                profile &&
                (Math.abs(lat - (profile.latitude || 0)) > 0.001 ||
                  Math.abs(lng - (profile.longitude || 0)) > 0.001)
              ) {
                api.put(`/donors/${profile.id}`, { latitude: lat, longitude: lng }).catch(() => {});
                setDonorProfile((prev) => (prev ? { ...prev, latitude: lat, longitude: lng } : prev));
              }
            },
            () => {},
            { timeout: 5000 }
          );
        }
      } else {
        fetchRequests();
      }
    } catch {
      fetchRequests();
    }
  };

  useEffect(() => {
    if (!session || session.user.role !== "donor") {
      navigate("/login");
      return;
    }
    loadDonorAndRequests();
  }, [session?.user?.id, session?.user?.role, navigate]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests(donorProfile?.id);
  };

  const handleOpenPledge = (req: DonorRequestItem) => {
    setSelectedRequest(req);
    setPledgeModalOpen(true);
  };

  const handlePledgeSubmit = async (data: { estimated_arrival: string; notes: string }) => {
    if (!selectedRequest || !donorProfile || !session) return;
    try {
      await api.post("/donation-pledges", {
        request_id: selectedRequest.id,
        hospital_id: selectedRequest.hospital_id,
        donor_id: donorProfile.id,
        donor_user_id: session.user.id,
        donor_name: session.user.name,
        donor_phone: donorProfile.phone || "",
        blood_group: donorProfile.blood_group,
        estimated_arrival: data.estimated_arrival,
        notes: data.notes,
      });

      showToast("Donation pledge recorded! The hospital has been notified.");
      setPledgeModalOpen(false);
      fetchRequests(donorProfile.id);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to record pledge", "error");
    }
  };

  const handleCancelPledge = async (requestId: string) => {
    const activePledge = pledges.find(
      (p) => p.request_id === requestId && (p.status === "pledged" || p.status === "acknowledged")
    );
    if (!activePledge) return;

    try {
      await api.put(`/donation-pledges/${activePledge.id}`, { status: "cancelled" });
      showToast("Pledge cancelled");
      if (donorProfile) fetchRequests(donorProfile.id);
    } catch {
      showToast("Unable to cancel pledge", "error");
    }
  };

  const donorLat = donorProfile?.latitude || 40.7128;
  const donorLng = donorProfile?.longitude || -74.006;
  const donorGroup = donorProfile?.blood_group || session?.user.blood_group || "O+";

  // Enrich requests with engines
  const enrichedRequests: DonorRequestItem[] = useMemo(() => {
    return requests.map((r) => {
      const hLat = r.hospital_latitude || 0;
      const hLng = r.hospital_longitude || 0;

      let distanceKm: number | null = null;
      let estimatedMins: number | null = null;

      if (donorLat !== 0 && donorLng !== 0 && hLat !== 0 && hLng !== 0) {
        distanceKm = calculateHaversineDistance(donorLat, donorLng, hLat, hLng);
        estimatedMins = calculateTravelTimeMinutes(distanceKm, "emergency");
      }

      const match = evaluateBloodMatch(donorGroup, r.blood_group);

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
      };
    });
  }, [requests, donorLat, donorLng, donorGroup]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return enrichedRequests.filter((r) => {
      // Blood Match Filter
      if (filterMode === "compatible") {
        if (!isBloodCompatible(donorGroup, r.blood_group)) return false;
      } else if (filterMode === "exact") {
        if (r.blood_group !== donorGroup) return false;
      } else if (filterMode === "urgent") {
        if (r.urgency !== "emergency" && r.urgency !== "urgent") return false;
        if (!isBloodCompatible(donorGroup, r.blood_group)) return false;
      }

      // Group Tab
      if (selectedGroupFilter !== "ALL" && r.blood_group !== selectedGroupFilter) {
        return false;
      }

      // Distance Radius Filter
      if (radiusFilter > 0 && r.distanceKm !== null && r.distanceKm !== undefined && r.distanceKm > radiusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.hospital_name.toLowerCase().includes(q) ||
          (r.hospital_address && r.hospital_address.toLowerCase().includes(q)) ||
          r.blood_group.toLowerCase().includes(q)
        );
      }

      return true;
    }).sort((a, b) => {
      const urgencyWeight = { emergency: 3, urgent: 2, normal: 1 };
      const uA = urgencyWeight[a.urgency] || 0;
      const uB = urgencyWeight[b.urgency] || 0;
      if (uB !== uA) return uB - uA;
      const distA = a.distanceKm ?? 9999;
      const distB = b.distanceKm ?? 9999;
      return distA - distB;
    });
  }, [enrichedRequests, filterMode, selectedGroupFilter, radiusFilter, searchQuery, donorGroup]);

  const activePledgedRequestIds = pledges
    .filter((p) => p.status === "pledged" || p.status === "acknowledged")
    .map((p) => p.request_id);

  const closestRequest = filteredRequests[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <PageHeader
        title="Live Blood Request Matching Center"
        description={`Displaying emergency requests filtered by your verified blood type (${donorGroup}) and GPS proximity.`}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
              Refresh
            </button>
            <Link
              to="/hospital/map"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Compass className="h-3.5 w-3.5" />
              Hospital Radar
            </Link>
          </div>
        }
      />

      {/* Matching Engine & Distance Control Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Match Mode Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-red-500" /> Match Mode:
            </span>
            {[
              { id: "compatible", label: `Compatible with ${donorGroup}` },
              { id: "exact", label: `Exact ${donorGroup} Only` },
              { id: "urgent", label: "Urgent Emergencies" },
              { id: "all", label: "All Active Broadcasts" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setFilterMode(m.id as typeof filterMode)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  filterMode === m.id
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative sm:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search hospital or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-red-500 focus:outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Blood Group Selectors & Radius Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-red-500" /> Target Type:
            </span>
            {["ALL", ...BLOOD_GROUPS].map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => setSelectedGroupFilter(bg)}
                className={`rounded-md px-2 py-0.5 text-xs font-bold transition cursor-pointer ${
                  selectedGroupFilter === bg
                    ? "bg-red-500 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {bg}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Compass className="h-3.5 w-3.5 text-blue-600" /> Radius:
            </span>
            {RADIUS_OPTIONS.map((rad) => (
              <button
                key={rad.label}
                type="button"
                onClick={() => setRadiusFilter(rad.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition cursor-pointer ${
                  radiusFilter === rad.value
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {rad.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Route Navigator for the top priority request */}
      {closestRequest && (
        <DonorRouteMap
          donorLat={donorLat}
          donorLng={donorLng}
          hospitalName={closestRequest.hospital_name}
          hospitalLat={closestRequest.hospital_latitude || donorLat + 0.02}
          hospitalLng={closestRequest.hospital_longitude || donorLng + 0.02}
          address={closestRequest.hospital_address}
        />
      )}

      {/* List of Matched Request Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-500 mb-3" />
            <p>Running clinical compatibility matching & geospatial calculations...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={Droplet}
            title="No Active Requests Matching Filters"
            description={`There are currently no active blood broadcasts matching ${donorGroup} within your selected criteria. Toggle to 'All Active Broadcasts' to view worldwide requests.`}
            action={
              <button
                type="button"
                onClick={() => {
                  setFilterMode("all");
                  setSelectedGroupFilter("ALL");
                  setRadiusFilter(0);
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Reset Filters & View All
              </button>
            }
          />
        ) : (
          filteredRequests.map((req) => {
            const isPledged = activePledgedRequestIds.includes(req.id);
            const userPledge = pledges.find((p) => p.request_id === req.id);

            return (
              <DonorRequestCard
                key={req.id}
                request={req}
                isPledged={isPledged}
                pledgeStatus={userPledge?.status}
                onPledgeClick={handleOpenPledge}
                onCancelPledgeClick={handleCancelPledge}
              />
            );
          })
        )}
      </div>

      {/* Standardized Pledge Dialog */}
      <PledgeDonationModal
        isOpen={pledgeModalOpen}
        onClose={() => setPledgeModalOpen(false)}
        request={selectedRequest}
        onPledgeSubmit={handlePledgeSubmit}
      />
    </div>
  );
}
