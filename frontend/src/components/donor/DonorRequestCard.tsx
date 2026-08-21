import { Phone, MapPin, Clock, HeartHandshake, CheckCircle2, X, Navigation } from "lucide-react";
import { UrgencyBadge, StatusBadge } from "@/components/ui/Badge";
import { formatDistance, formatTravelTime } from "@/lib/distanceEngine";

export interface DonorRequestItem {
  id: string;
  hospital_id: string;
  hospital_name: string;
  hospital_phone: string;
  emergency_contact: string;
  hospital_address: string;
  hospital_latitude?: number;
  hospital_longitude?: number;
  blood_group: string;
  units_required: number;
  urgency: "normal" | "urgent" | "emergency";
  status: string;
  created_at: string;
  distanceKm?: number | null;
  estimatedMins?: number | null;
  matchScore?: number;
  matchTier?: string;
  matchLabel?: string;
  badgeBg?: string;
  badgeColor?: string;
  badgeBorder?: string;
}

interface DonorRequestCardProps {
  request: DonorRequestItem;
  isPledged?: boolean;
  pledgeStatus?: string;
  onPledgeClick?: (request: DonorRequestItem) => void;
  onCancelPledgeClick?: (requestId: string) => void;
}

export function DonorRequestCard({
  request,
  isPledged = false,
  pledgeStatus,
  onPledgeClick,
  onCancelPledgeClick,
}: DonorRequestCardProps) {
  const hotline = request.emergency_contact || request.hospital_phone;

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-xs transition sm:flex-row sm:items-center sm:justify-between ${
        isPledged
          ? "border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-200"
          : "border-slate-200/80 hover:border-slate-300"
      }`}
    >
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <UrgencyBadge urgency={request.urgency} />
          <span className="text-sm font-bold text-slate-900">{request.hospital_name}</span>
          <StatusBadge status={request.status} />

          {request.matchLabel && (
            <span
              className={`rounded-md border px-2 py-0.5 text-[11px] font-extrabold ${
                request.badgeBg || "bg-blue-50"
              } ${request.badgeColor || "text-blue-700"} ${
                request.badgeBorder || "border-blue-200"
              }`}
            >
              {request.matchLabel}
            </span>
          )}

          {isPledged && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 animate-pulse">
              <CheckCircle2 className="h-3 w-3" />
              Pledge Active ({pledgeStatus || "Pledged"})
            </span>
          )}
        </div>

        <p className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          {request.hospital_address}
          {request.distanceKm !== undefined && request.distanceKm !== null && (
            <span className="ml-1 font-semibold text-slate-700">
              • {formatDistance(request.distanceKm)} ({formatTravelTime(request.estimatedMins)})
            </span>
          )}
        </p>

        <p className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="h-3 w-3 shrink-0" />
          Broadcasted on {new Date(request.created_at).toLocaleString()}
        </p>
      </div>

      <div className="flex flex-col sm:items-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
        <div className="text-left sm:text-right">
          <p className="text-lg font-extrabold text-red-600 tracking-tight">
            {request.units_required} <span className="text-xs font-semibold text-slate-500">Units Needed</span>
          </p>
          <p className="text-[11px] font-medium text-slate-400">Target Group: {request.blood_group}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${hotline}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 transition cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5 text-blue-600" />
            Call Hotline
          </a>

          {request.hospital_latitude && request.hospital_longitude ? (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${request.hospital_latitude},${request.hospital_longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Navigate Route"
            >
              <Navigation className="h-3.5 w-3.5 text-slate-600" />
            </a>
          ) : null}

          {isPledged ? (
            <button
              type="button"
              onClick={() => onCancelPledgeClick?.(request.id)}
              className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Cancel Pledge
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onPledgeClick?.(request)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition cursor-pointer"
            >
              <HeartHandshake className="h-3.5 w-3.5" />
              Pledge Donation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
