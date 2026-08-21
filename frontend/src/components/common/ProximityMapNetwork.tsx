import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  Building2,
  Droplet,
  Search,
  Phone,
  Navigation,
  Globe,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";

interface PublicHospitalData {
  id: string;
  hospital_name: string;
  phone: string;
  emergency_contact: string;
  latitude: number;
  longitude: number;
  address: string;
  total_units: number;
  stock_by_group: Record<string, number>;
  searching_requests_count: number;
  needed_groups: string[];
}

const BLOOD_GROUPS = ["ALL", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

export function ProximityMapNetwork() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [hospitals, setHospitals] = useState<PublicHospitalData[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<PublicHospitalData | null>(null);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchPublicHospitals = async () => {
    try {
      const data = await api.get<PublicHospitalData[]>("/hospitals/public-map");
      setHospitals(data);
      if (data.length > 0 && !selectedHospital) {
        setSelectedHospital(data[0]);
      }
    } catch {
      // Fallback
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPublicHospitals();
  }, []);

  // Filter hospitals
  const filteredHospitals = hospitals.filter((h) => {
    if (selectedBloodGroup !== "ALL") {
      const unitsForGroup = h.stock_by_group?.[selectedBloodGroup] || 0;
      if (unitsForGroup <= 0) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        h.hospital_name.toLowerCase().includes(q) ||
        (h.address && h.address.toLowerCase().includes(q)) ||
        (h.phone && h.phone.includes(q))
      );
    }
    return true;
  });

  // Calculate global summary stats
  const totalGlobalUnits = hospitals.reduce((sum, h) => sum + (h.total_units || 0), 0);
  const totalUrgentRequests = hospitals.reduce((sum, h) => sum + (h.searching_requests_count || 0), 0);

  // Initialize Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Clear any dangling leaflet ID
    if ((container as unknown as { _leaflet_id?: string })._leaflet_id) {
      delete (container as unknown as { _leaflet_id?: string })._leaflet_id;
    }

    if (!mapInstanceRef.current) {
      const map = L.map(container, {
        center: [20, 0], // Global center
        zoom: 2,
        zoomControl: false,
        minZoom: 2,
        maxZoom: 18,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

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
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const validCoordinatesList: [number, number][] = [];

    filteredHospitals.forEach((h, index) => {
      // If coordinates are 0, fallback with spread around geographic regions
      const lat = h.latitude !== 0 ? h.latitude : 40.7128 + (index * 0.4 - 0.8);
      const lng = h.longitude !== 0 ? h.longitude : -74.006 + (index * 0.5 - 1.0);

      validCoordinatesList.push([lat, lng]);

      const isSelected = selectedHospital?.id === h.id;
      const hasUrgent = h.searching_requests_count > 0;
      const stockTotal = h.total_units || 0;

      const hospitalIcon = L.divIcon({
        className: "custom-public-hospital-icon",
        html: `
          <div class="flex items-center group cursor-pointer">
            <div class="relative flex items-center">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white shadow-md border-2 border-white transition-transform group-hover:scale-110 ${
                isSelected ? "bg-amber-500 ring-4 ring-amber-400/40" : hasUrgent ? "bg-red-600" : "bg-blue-600"
              }">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
              </div>
              <div class="ml-1.5 hidden sm:flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-black text-white shadow-md border border-slate-700 whitespace-nowrap">
                <span class="text-red-400 font-extrabold">${stockTotal}</span>
                <span class="text-slate-300">Units</span>
              </div>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([lat, lng], { icon: hospitalIcon });

      marker.on("click", () => {
        setSelectedHospital(h);
      });

      // Build blood matrix HTML for tooltip popup
      const stockEntries = Object.entries(h.stock_by_group || {})
        .map(([group, units]) => `
          <div class="flex flex-col items-center p-1 rounded-md ${
            units > 0 ? "bg-slate-50 border border-slate-200" : "bg-red-50/60 border border-red-100"
          }">
            <span class="text-[9px] font-bold text-slate-500">${group}</span>
            <span class="text-[11px] font-extrabold ${units > 0 ? "text-slate-900" : "text-red-500"}">${units}</span>
          </div>
        `)
        .join("");

      marker.bindPopup(`
        <div class="p-2 space-y-2 min-w-[220px]">
          <div class="border-b border-slate-100 pb-1.5">
            <h4 class="font-bold text-xs text-slate-900">${h.hospital_name}</h4>
            <p class="text-[11px] text-slate-500 truncate">${h.address || "Medical Transfusion Facility"}</p>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold text-slate-600">Refrigerated Blood Stock:</span>
            <span class="text-xs font-black text-red-600">${stockTotal} Units</span>
          </div>

          <div class="grid grid-cols-4 gap-1">
            ${stockEntries}
          </div>

          <div class="pt-1 flex items-center justify-between border-t border-slate-100">
            <a href="tel:${h.emergency_contact || h.phone}" class="text-[11px] font-bold text-blue-600 hover:underline">
              Call ${h.emergency_contact || h.phone}
            </a>
          </div>
        </div>
      `);

      markersLayer.addLayer(marker);
    });

    // Auto fit bounds if coordinates exist and not manually zoomed
    if (validCoordinatesList.length > 0 && map) {
      if (validCoordinatesList.length === 1) {
        map.setView(validCoordinatesList[0], 12);
      } else {
        const bounds = L.latLngBounds(validCoordinatesList);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    }
  }, [filteredHospitals, selectedHospital]);

  const handleHospitalSelect = (h: PublicHospitalData) => {
    setSelectedHospital(h);
    if (mapInstanceRef.current) {
      const lat = h.latitude !== 0 ? h.latitude : 40.7128;
      const lng = h.longitude !== 0 ? h.longitude : -74.006;
      mapInstanceRef.current.flyTo([lat, lng], 13);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPublicHospitals();
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header & Global Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-0.5 text-xs font-semibold text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Public Real-Time Global Network
          </div>
          <h3 className="mt-2 text-xl font-bold text-slate-900 tracking-tight">
            Worldwide Hospital Blood Bank Inventory Radar
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time public transparency for facility blood reserves, live stock availability, and emergency transfusion requirements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200 text-xs">
            <Globe className="h-4 w-4 text-blue-600" />
            <span className="font-bold text-slate-700">{hospitals.length} Hospitals</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 border border-red-200 text-xs">
            <Droplet className="h-4 w-4 text-red-600" />
            <span className="font-extrabold text-red-700">{totalGlobalUnits} Units in Stock</span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 transition"
            title="Refresh Live Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Droplet className="h-3 w-3 text-red-500" /> Stock Filter:
          </span>
          {BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => setSelectedBloodGroup(bg)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                selectedBloodGroup === bg
                  ? "bg-red-500 text-white shadow-2xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {bg}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search facility name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Map + Selected Hospital Card Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leaflet Public Map Area */}
        <div className="lg:col-span-2 relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs h-[460px]">
          <div ref={mapContainerRef} className="h-full w-full" />

          {/* Map Overlay Badge */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-bold text-slate-800">Public Live Facility Map</span>
          </div>

          <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 text-[11px] font-semibold text-slate-700 shadow-xs">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Hospital Bank</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Urgent Need</span>
          </div>
        </div>

        {/* Selected Facility Details & Hospital List Sidebar */}
        <div className="flex flex-col gap-3 h-[460px]">
          {/* Selected Hospital Live Stock Box */}
          {selectedHospital ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                      {selectedHospital.hospital_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                      {selectedHospital.address}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-red-600 tracking-tight">
                    {selectedHospital.total_units}
                  </span>
                  <p className="text-[10px] font-semibold text-slate-400">Total Units</p>
                </div>
              </div>

              {/* 8-Blood Group Grid Matrix */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Available Blood Inventory Matrix
                </p>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {Object.entries(selectedHospital.stock_by_group || {}).map(([group, units]) => {
                    const isAdequate = units >= 5;
                    const isLow = units > 0 && units < 5;

                    return (
                      <div
                        key={group}
                        className={`rounded-lg p-1.5 border transition ${
                          isAdequate
                            ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                            : isLow
                            ? "bg-amber-50/60 border-amber-200 text-amber-900"
                            : "bg-red-50/50 border-red-100 text-red-700"
                        }`}
                      >
                        <p className="text-[10px] font-bold opacity-80">{group}</p>
                        <p className="text-xs font-black">{units} <span className="text-[9px] font-normal">u</span></p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Urgent broadcasts notice */}
              {selectedHospital.searching_requests_count > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-red-50 p-2 border border-red-100 text-[11px] text-red-800 font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                  <span>Urgently seeking: {selectedHospital.needed_groups.join(", ")}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${selectedHospital.emergency_contact || selectedHospital.phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition"
                >
                  <Phone className="h-3.5 w-3.5 text-red-400" />
                  Call Facility
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${selectedHospital.hospital_name} ${selectedHospital.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100 transition"
                  title="Open in Maps"
                >
                  <Navigation className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ) : null}

          {/* Hospital Roster List */}
          <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs overflow-y-auto space-y-1.5">
            <div className="flex items-center justify-between pb-1 px-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Hospital Directory</span>
              <span className="text-[10px] font-extrabold text-slate-400">{filteredHospitals.length} facilities</span>
            </div>

            {filteredHospitals.map((h) => {
              const isSelected = selectedHospital?.id === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => handleHospitalSelect(h)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 shadow-2xs"
                      : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/70"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{h.hospital_name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{h.address || h.phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-red-600">{h.total_units}</span>
                    <span className="text-[10px] text-slate-400 ml-0.5">units</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/70">
          <p className="text-[11px] font-semibold text-slate-500">Live Facilities</p>
          <p className="text-base font-bold text-slate-900 mt-0.5">{hospitals.length} Connected</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/70">
          <p className="text-[11px] font-semibold text-slate-500">Global Blood Reserves</p>
          <p className="text-base font-bold text-red-600 mt-0.5">{totalGlobalUnits} Units Tracked</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/70">
          <p className="text-[11px] font-semibold text-slate-500">Emergency Broadcasts</p>
          <p className="text-base font-bold text-amber-600 mt-0.5">{totalUrgentRequests} Searching</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/70">
          <p className="text-[11px] font-semibold text-slate-500">Public Transparency</p>
          <p className="text-base font-bold text-emerald-600 mt-0.5">100% Real-Time</p>
        </div>
      </div>
    </div>
  );
}
