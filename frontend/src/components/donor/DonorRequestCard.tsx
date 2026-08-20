import { Phone, MapPin, Clock } from "lucide-react";
import { UrgencyBadge, StatusBadge } from "@/components/ui/Badge";

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
}

export function DonorRequestCard({ request }: { request: DonorRequestItem }) {
  const hotline = request.emergency_contact || request.hospital_phone;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <UrgencyBadge urgency={request.urgency} />
          <span className="text-sm font-bold text-slate-900">{request.hospital_name}</span>
          <StatusBadge status={request.status} />
        </div>

        <p className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          {request.hospital_address}
        </p>

        <p className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="h-3 w-3 shrink-0" />
          Broadcasted on {new Date(request.created_at).toLocaleString()}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
        <div className="text-left sm:text-right">
          <p className="text-lg font-extrabold text-red-600 tracking-tight">
            {request.units_required} <span className="text-xs font-semibold text-slate-500">Units</span>
          </p>
          <p className="text-[11px] font-medium text-slate-400">Group: {request.blood_group}</p>
        </div>

        <a
          href={`tel:${hotline}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition"
        >
          <Phone className="h-3.5 w-3.5" />
          Call Hospital
        </a>
      </div>
    </div>
  );
}
