import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import {
  Phone,
  Send,
  Search,
  Compass,
  Sparkles,
  Calendar,
} from "lucide-react";
import type { DonorMapItem } from "@/types";
import {
  BLOOD_GROUPS,
  evaluateBloodMatch,
  getCompatibleDonorGroups,
} from "@/lib/bloodMatchingEngine";
import {
  calculateHaversineDistance,
  calculateTravelTimeMinutes,
  formatDistance,
  formatTravelTime,
} from "@/lib/distanceEngine";

interface HospitalDonorMapProps {
  hospitalName: string;
  hospitalLat: number;
  hospitalLng: number;
  donors: DonorMapItem[];
  onDirectRequest: (donor: DonorMapItem) => void;
  targetBloodGroup?: string;
}

const RADIUS_OPTIONS = [
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
  { label: "Any", value: 0 },
];

const DONATION_INTERVAL_OPTIONS = [
  { id: "all", label: "All Donation Histories" },
  { id: "eligible_56", label: "Eligible (>56 days or never)" },
  { id: "eligible_90", label: "Resting (>90 days or never)" },
  { id: "recent_56", label: "Recent Donors (<56 days)" },
  { id: "first_time", label: "First-Time Donors" },
];

export function HospitalDonorMap({
  hospitalName,
  hospitalLat,
  hospitalLng,
  donors,
  onDirectRequest,
  targetBloodGroup = "O+",
}: HospitalDonorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const hospitalMarkerRef = useRef<L.Marker | null>(null);
  const hospitalCircleRef = useRef<L.Circle | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>("ALL");
  const [matchMode, setMatchMode] = useState<"all" | "exact" | "compatible" | "universal">("all");
  const [donationIntervalFilter, setDonationIntervalFilter] = useState<string>("all");
  const [radiusFilter, setRadiusFilter] = useState<number>(25); // km, 0 = all
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDonor, setSelectedDonor] = useState<DonorMapItem | null>(null);

  // Fallback coords if hospital has 0,0
  const centerLat = hospitalLat !== 0 ? hospitalLat : 40.7128;
  const centerLng = hospitalLng !== 0 ? hospitalLng : -74.006;

  // Compute distances, travel time, match scores, and donation intervals
  const computedDonors = useMemo(() => {
    const now = new Date();
    return donors.map((d) => {
      const lat = d.latitude || centerLat + (Math.random() - 0.5) * 0.05;
      const lng = d.longitude || centerLng + (Math.random() - 0.5) * 0.05;
      const dist = calculateHaversineDistance(centerLat, centerLng, lat, lng);
      const mins = calculateTravelTimeMinutes(dist, "emergency");
      const match = evaluateBloodMatch(d.blood_group, targetBloodGroup);

      let daysSinceLastDonation: number | null = null;
      let lastDonatedFormatted = "Never Donated (First-Time Donor)";

      if (d.last_donation_date) {
        const lastDate = new Date(d.last_donation_date);
        if (!isNaN(lastDate.getTime())) {
          const diffDays = Math.max(0, Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)));
          daysSinceLastDonation = diffDays;
          lastDonatedFormatted = `${diffDays} days ago (${d.last_donation_date})`;
        }
      }

      return {
        ...d,
        latitude: lat,
        longitude: lng,
        distanceKm: dist,
        estimatedMins: mins,
        matchScore: match.score,
        matchTier: match.tier,
        matchLabel: match.label,
        badgeColor: match.badgeColor,
        badgeBg: match.badgeBg,
        badgeBorder: match.badgeBorder,
        compatible: match.compatible,
        days_since_last_donation: daysSinceLastDonation,
        last_donation_formatted: lastDonatedFormatted,
      } as DonorMapItem & { days_since_last_donation: number | null; last_donation_formatted: string };
    });
  }, [donors, centerLat, centerLng, targetBloodGroup]);

  // Filter donors
  const filteredDonors = useMemo(() => {
    return computedDonors.filter((d) => {
      // Match Mode filter
      if (matchMode === "exact" && d.blood_group !== targetBloodGroup) return false;
      if (matchMode === "universal" && d.blood_group !== "O-") return false;
      if (matchMode === "compatible") {
        const compatibleGroups = getCompatibleDonorGroups(targetBloodGroup);
        if (!compatibleGroups.includes(d.blood_group)) return false;
      }

      // Specific blood group tab
      if (selectedBloodGroup !== "ALL" && d.blood_group !== selectedBloodGroup) return false;

      // Last Donation Interval Filter
      if (donationIntervalFilter === "eligible_56") {
        if (d.days_since_last_donation !== null && d.days_since_last_donation < 56) {
          return false;
        }
      } else if (donationIntervalFilter === "eligible_90") {
        if (d.days_since_last_donation !== null && d.days_since_last_donation < 90) {
          return false;
        }
      } else if (donationIntervalFilter === "recent_56") {
        if (d.days_since_last_donation === null || d.days_since_last_donation >= 56) {
          return false;
        }
      } else if (donationIntervalFilter === "first_time") {
        if (d.last_donation_date) return false;
      }

      // Availability filter
      if (onlyAvailable && !d.availability) return false;

      // Distance Radius filter
      if (radiusFilter > 0 && (d.distanceKm || 0) > radiusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.donor_name.toLowerCase().includes(q) ||
          d.blood_group.toLowerCase().includes(q) ||
          d.phone.includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if ((b.matchScore || 0) !== (a.matchScore || 0)) {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      return (a.distanceKm || 0) - (b.distanceKm || 0);
    });
  }, [computedDonors, matchMode, targetBloodGroup, selectedBloodGroup, donationIntervalFilter, onlyAvailable, radiusFilter, searchQuery]);

  // 1. Initialize Map ONCE on mount
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Clear any dangling leaflet ID
    if ((container as unknown as { _leaflet_id?: string })._leaflet_id) {
      delete (container as unknown as { _leaflet_id?: string })._leaflet_id;
    }

    if (!mapInstanceRef.current) {
      const map = L.map(container, {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Hospital Marker
      const hospitalIcon = L.divIcon({
        className: "custom-hospital-icon",
        html: `
          <div class="relative flex items-center justify-center">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white shadow-md border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const hospMarker = L.marker([centerLat, centerLng], { icon: hospitalIcon });
      hospMarker.bindPopup(`
        <div class="p-1 text-center font-sans">
          <p class="text-xs font-bold text-blue-700">Hospital Facility Center</p>
          <p class="text-sm font-black text-slate-900">${hospitalName}</p>
        </div>
      `);
      hospMarker.addTo(map);
      hospitalMarkerRef.current = hospMarker;

      // Hospital Proximity Circle
      const circle = L.circle([centerLat, centerLng], {
        color: "#3b82f6",
        fillColor: "#60a5fa",
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: "4, 6",
        radius: (radiusFilter || 25) * 1000,
      }).addTo(map);
      hospitalCircleRef.current = circle;

      // Donors Layer
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;

      // Invalidate size after layout settles to prevent tile seam glitching
      setTimeout(() => {
        map.invalidateSize();
      }, 200);

      // ResizeObserver to handle layout/flex changes smoothly
      const ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(container);

      return () => {
        ro.disconnect();
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, []); // Empty dependency array: Map initializes once without recreation

  // 2. Smoothly update hospital position & center without re-creating map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (hospitalMarkerRef.current) {
      hospitalMarkerRef.current.setLatLng([centerLat, centerLng]);
      hospitalMarkerRef.current.setPopupContent(`
        <div class="p-1 text-center font-sans">
          <p class="text-xs font-bold text-blue-700">Hospital Facility Center</p>
          <p class="text-sm font-black text-slate-900">${hospitalName}</p>
        </div>
      `);
    }

    if (hospitalCircleRef.current) {
      hospitalCircleRef.current.setLatLng([centerLat, centerLng]);
    }
  }, [centerLat, centerLng, hospitalName]);

  // 3. Update Radius Circle
  useEffect(() => {
    if (hospitalCircleRef.current) {
      if (radiusFilter > 0) {
        hospitalCircleRef.current.setRadius(radiusFilter * 1000);
        hospitalCircleRef.current.setStyle({ opacity: 1, fillOpacity: 0.08 });
      } else {
        hospitalCircleRef.current.setStyle({ opacity: 0, fillOpacity: 0 });
      }
    }
  }, [radiusFilter]);

  // 4. Update Donor Markers in Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    filteredDonors.forEach((donor) => {
      const isSelected = selectedDonor?.id === donor.id;
      const isAvailable = donor.availability;
      const isExact = donor.blood_group === targetBloodGroup;
      const isUniversal = donor.blood_group === "O-";

      const badgeBg = isExact ? "bg-red-600" : isUniversal ? "bg-purple-600" : isAvailable ? "bg-amber-600" : "bg-slate-500";

      const donorIcon = L.divIcon({
        className: "custom-donor-icon",
        html: `
          <div class="relative group cursor-pointer">
            <div class="flex h-9 w-9 items-center justify-center rounded-full font-black text-white text-xs shadow-md border-2 border-white transition-transform group-hover:scale-110 ${badgeBg} ${
              isSelected ? "ring-4 ring-amber-400 scale-105" : ""
            }">
              ${donor.blood_group}
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white ${
              isAvailable ? "bg-emerald-500" : "bg-slate-400"
            }"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([donor.latitude, donor.longitude], { icon: donorIcon });

      marker.on("click", () => {
        setSelectedDonor(donor);
      });

      const lastDonatedText = donor.last_donation_date
        ? `Last Donated: ${donor.last_donation_date}`
        : "First-Time Donor (Never Donated)";

      marker.bindPopup(`
        <div class="p-1 space-y-1 text-slate-800 font-sans min-w-[190px]">
          <div class="flex items-center justify-between border-b border-slate-100 pb-1">
            <p class="font-bold text-xs text-slate-900">${donor.donor_name}</p>
            <span class="rounded bg-red-100 px-1.5 py-0.2 text-[10px] font-extrabold text-red-700">${donor.blood_group}</span>
          </div>
          <p class="text-[11px] text-slate-500">Distance: ${formatDistance(donor.distanceKm)} (${formatTravelTime(donor.estimatedMins)})</p>
          <p class="text-[10px] font-semibold text-slate-600">${lastDonatedText}</p>
          <p class="text-[10px] font-bold ${isAvailable ? "text-emerald-600" : "text-slate-500"}">
            ${isAvailable ? "Status: Available to Donate" : "Status: Self-marked Unavailable"}
          </p>
        </div>
      `);

      markersLayer.addLayer(marker);
    });
  }, [filteredDonors, selectedDonor, targetBloodGroup]);

  const handleSelectDonor = (donor: DonorMapItem) => {
    setSelectedDonor(donor);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([donor.latitude, donor.longitude], 14, { duration: 0.8 });
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
      {/* Top Header & Telemetry */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 text-xs font-semibold text-blue-700">
            <Compass className="h-3.5 w-3.5" />
            Clinical Blood Matching & Geospatial Radar
          </div>
          <h2 className="mt-1.5 text-xl font-extrabold text-slate-900 tracking-tight">
            Live Donor Locator & Clinical History Filtering
          </h2>
          <p className="text-xs text-slate-500">
            Real-time proximity computation, ABO/Rh compatibility, and last donation date tracking for {hospitalName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-center">
            <p className="text-xs font-bold text-slate-900">{filteredDonors.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold">Matched Donors</p>
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-center">
            <p className="text-xs font-bold text-emerald-700">
              {filteredDonors.filter((d) => d.availability).length}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold">Available Now</p>
          </div>
        </div>
      </div>

      {/* Control Bar: Matching Mode & Search */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Matching Engine Mode Toggle */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-red-500" /> Match Mode:
            </span>
            {[
              { id: "all", label: "All Groups" },
              { id: "compatible", label: `Compatible with ${targetBloodGroup}` },
              { id: "exact", label: `Exact ${targetBloodGroup}` },
              { id: "universal", label: "Universal (O-)" },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setMatchMode(mode.id as typeof matchMode)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  matchMode === mode.id
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search donor name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Last Donation History Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-blue-600" /> Last Donated Filter:
          </span>
          {DONATION_INTERVAL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setDonationIntervalFilter(opt.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                donationIntervalFilter === opt.id
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Radius Filter & Specific Blood Group Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Blood Type:</span>
            {["ALL", ...BLOOD_GROUPS].map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => setSelectedBloodGroup(bg)}
                className={`rounded-md px-2 py-0.5 text-xs font-bold transition cursor-pointer ${
                  selectedBloodGroup === bg
                    ? "bg-red-500 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {bg}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Radius:</span>
              {RADIUS_OPTIONS.map((rad) => (
                <button
                  key={rad.label}
                  type="button"
                  onClick={() => setRadiusFilter(rad.value)}
                  className={`rounded-lg px-2 py-0.5 text-xs font-extrabold transition cursor-pointer ${
                    radiusFilter === rad.value
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {rad.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-red-600 focus:ring-0 cursor-pointer"
              />
              Available Only
            </label>
          </div>
        </div>
      </div>

      {/* Map & Donor List Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leaflet Radar Map Area */}
        <div className="lg:col-span-2 relative rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden shadow-xs h-[460px]">
          <div ref={mapContainerRef} className="h-full w-full" />

          {/* Map Overlay Badge */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-800">
              Live Radar: {radiusFilter > 0 ? `${radiusFilter} km Radius` : "Worldwide Range"}
            </span>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 text-[11px] font-semibold text-slate-700 shadow-xs">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Hospital</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Exact Match</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-purple-600" /> Universal (O-)</span>
          </div>
        </div>

        {/* Matched Donors Drawer */}
        <div className="flex flex-col gap-3 h-[460px]">
          {/* Selected Donor Spotlight Card */}
          {selectedDonor ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{selectedDonor.donor_name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" />
                    {selectedDonor.phone}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-black text-red-700">
                    {selectedDonor.blood_group}
                  </span>
                  <span className={`text-[10px] font-extrabold mt-1 px-1.5 py-0.2 rounded border ${selectedDonor.badgeBg || "bg-slate-50"} ${selectedDonor.badgeColor || "text-slate-600"} ${selectedDonor.badgeBorder || "border-slate-200"}`}>
                    {selectedDonor.matchLabel || "Compatible"}
                  </span>
                </div>
              </div>

              {/* Last Donation Date Detail */}
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> Last Donated:
                  </span>
                  <span className="font-extrabold text-slate-800">
                    {selectedDonor.last_donation_date
                      ? selectedDonor.last_donation_date
                      : "First-Time (Never Donated)"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Donor Status:</span>
                  <span className={`font-bold ${selectedDonor.availability ? "text-emerald-600" : "text-slate-500"}`}>
                    {selectedDonor.availability ? "Available to Donate" : "Marked Unavailable"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Proximity</p>
                  <p className="font-extrabold text-slate-800">{formatDistance(selectedDonor.distanceKm)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Travel Time</p>
                  <p className="font-extrabold text-slate-800">{formatTravelTime(selectedDonor.estimatedMins)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onDirectRequest(selectedDonor)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  Direct Emergency Ping
                </button>
                <a
                  href={`tel:${selectedDonor.phone}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Call Donor"
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ) : null}

          {/* Donor Directory List */}
          <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs overflow-y-auto space-y-1.5">
            <div className="flex items-center justify-between pb-1 px-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Ranked Matched Donors</span>
              <span className="text-[10px] font-extrabold text-slate-400">{filteredDonors.length} found</span>
            </div>

            {filteredDonors.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No matching donors found within this filter criteria.
              </div>
            ) : (
              filteredDonors.map((d) => {
                const isSelected = selectedDonor?.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDonor(d)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? "border-red-500 bg-red-50/50 shadow-2xs"
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate">{d.donor_name}</p>
                        {d.availability && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" title="Available" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {formatDistance(d.distanceKm)} • {formatTravelTime(d.estimatedMins)}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        Last donated: {d.last_donation_date ? d.last_donation_date : "Never (First Time)"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-extrabold text-red-700">
                        {d.blood_group}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
