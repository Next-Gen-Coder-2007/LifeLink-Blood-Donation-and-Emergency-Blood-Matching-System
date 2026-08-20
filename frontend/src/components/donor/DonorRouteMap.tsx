import { MapPin, Navigation, Clock, Building2, ExternalLink } from "lucide-react";

interface DonorRouteMapProps {
  donorLat: number;
  donorLng: number;
  hospitalName: string;
  hospitalLat: number;
  hospitalLng: number;
  address?: string;
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function DonorRouteMap({
  donorLat,
  donorLng,
  hospitalName,
  hospitalLat,
  hospitalLng,
  address,
}: DonorRouteMapProps) {
  const distanceKm = calculateHaversineDistance(donorLat, donorLng, hospitalLat, hospitalLng);
  const estimatedTimeMins = Math.max(5, Math.round(distanceKm * 2.2)); // avg city speed estimate

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${donorLat},${donorLng}&destination=${hospitalLat},${hospitalLng}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 mt-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">{hospitalName}</p>
            {address && <p className="text-[11px] text-slate-500 truncate max-w-xs">{address}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
            <Navigation className="h-3.5 w-3.5 text-red-500" />
            <span>{distanceKm} km away</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
            <Clock className="h-3.5 w-3.5" />
            <span>~{estimatedTimeMins} mins</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 font-mono">
          <MapPin className="h-3 w-3 text-slate-400" />
          Route: ({donorLat.toFixed(3)}, {donorLng.toFixed(3)}) → ({hospitalLat.toFixed(3)}, {hospitalLng.toFixed(3)})
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-2xs"
        >
          <Navigation className="h-3 w-3" />
          Open Navigation Route
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
