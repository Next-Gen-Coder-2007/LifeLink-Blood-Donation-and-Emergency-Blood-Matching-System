import { useState } from "react";
import {
  Send,
  Droplet,
  MapPin,
  Clock,
  Phone,
  Building2,
  Sparkles,
} from "lucide-react";
import type { DonorMapItem } from "@/types";
import { Modal } from "@/components/ui/Modal";

interface DirectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  donor: DonorMapItem | null;
  hospitalName: string;
  onSendDirectRequest: (donorId: string, message: string) => Promise<void>;
}

const CLINICAL_TEMPLATES = [
  {
    id: "trauma_emergency",
    label: "Trauma / Surgery Critical",
    urgency: "emergency",
    units: 2,
    department: "Trauma Surgery & ICU",
    text: "CRITICAL TRANSFUSION DIRECTIVE: Immediate blood units required for surgical/trauma emergency. Your verified blood group is an exact/compatible match. Please arrive at the facility blood bank triage desk immediately or contact our emergency desk.",
  },
  {
    id: "stock_depletion",
    label: "Refrigerated Stock Deficit",
    urgency: "urgent",
    units: 1,
    department: "Blood Bank Storage Unit",
    text: "URGENT REPLENISHMENT DIRECTIVE: Refrigerated blood bank reserves for your specific blood group have dropped below safety thresholds. We urgently request your volunteer donation today.",
  },
  {
    id: "pediatric_need",
    label: "Urgent Hematology Requirement",
    urgency: "urgent",
    units: 1,
    department: "Clinical Hematology Desk",
    text: "URGENT CLINICAL REQUEST: A patient under our care requires matched blood units. Your verified donor profile matches this clinical requirement. Please confirm arrival if available.",
  },
];

export function DirectRequestModal({
  isOpen,
  onClose,
  donor,
  hospitalName,
  onSendDirectRequest,
}: DirectRequestModalProps) {
  const [urgencyLevel, setUrgencyLevel] = useState<"emergency" | "urgent" | "normal">("emergency");
  const [unitsNeeded, setUnitsNeeded] = useState<number>(1);
  const [department, setDepartment] = useState("Trauma Surgery & ICU");
  const [customMessage, setCustomMessage] = useState(CLINICAL_TEMPLATES[0].text);
  const [submitting, setSubmitting] = useState(false);

  if (!donor) return null;

  const handleApplyTemplate = (tmpl: typeof CLINICAL_TEMPLATES[0]) => {
    setUrgencyLevel(tmpl.urgency as typeof urgencyLevel);
    setUnitsNeeded(tmpl.units);
    setDepartment(tmpl.department);
    setCustomMessage(tmpl.text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const fullDirective = `[PRIORITY: ${urgencyLevel.toUpperCase()}] [DEPT: ${department}] [UNITS: ${unitsNeeded}]
${customMessage.trim() || CLINICAL_TEMPLATES[0].text}

Facility: ${hospitalName}
Target Blood Type: ${donor.blood_group}
Donor Proximity: ${donor.distanceKm ?? "Nearby"} km (~${donor.estimatedMins ?? "15"} mins travel)`;

    try {
      await onSendDirectRequest(donor.id, fullDirective);
      onClose();
    } catch {
      // Handled by parent toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      icon={<Building2 className="h-6 w-6 text-red-600" />}
      title="Direct Clinical Blood Directive"
      description={`Dispatch a formal medical emergency alert from ${hospitalName} to this verified donor`}
    >
      <div className="space-y-4">
        {/* Donor Dossier Overview Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">{donor.donor_name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${donor.availability ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                {donor.availability ? "Available to Donate" : "Marked Resting"}
              </span>
            </div>
            <span className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-0.5 text-xs font-black text-white shadow-2xs">
              <Droplet className="h-3 w-3 fill-current" />
              {donor.blood_group}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white border border-slate-200/80 p-2 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">PROXIMITY</span>
              <span className="font-bold text-slate-800 flex items-center justify-center gap-0.5 mt-0.5">
                <MapPin className="h-3 w-3 text-slate-400" />
                {donor.distanceKm ? `${donor.distanceKm} km` : "Nearby"}
              </span>
            </div>

            <div className="rounded-xl bg-white border border-slate-200/80 p-2 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">TRAVEL TIME</span>
              <span className="font-bold text-slate-800 flex items-center justify-center gap-0.5 mt-0.5">
                <Clock className="h-3 w-3 text-slate-400" />
                ~{donor.estimatedMins || "15"} mins
              </span>
            </div>

            <div className="rounded-xl bg-white border border-slate-200/80 p-2 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">LAST DONATED</span>
              <span className="font-bold text-slate-800 text-[11px] block mt-0.5 truncate">
                {donor.last_donation_date || "First-Time"}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Priority Level & Units Needed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Clinical Priority Tier
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "emergency", label: "Critical" },
                  { id: "urgent", label: "Urgent" },
                  { id: "normal", label: "Standard" },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setUrgencyLevel(tier.id as typeof urgencyLevel)}
                    className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                      urgencyLevel === tier.id
                        ? "bg-red-600 text-white shadow-2xs"
                        : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Units Required
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnitsNeeded(u)}
                    className={`flex-1 rounded-xl py-2 text-xs font-black transition cursor-pointer ${
                      unitsNeeded === u
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {u} {u === 1 ? "Unit" : "Units"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clinical Department / Case Reference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Department / Emergency Unit Reference
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Trauma Surgery Suite / ICU Emergency"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Quick Clinical Directives Templates */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Clinical Templates (1-Click Apply)
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CLINICAL_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Directive Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Directive Message Preview
            </label>
            <textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 shadow-2xs focus:border-red-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Direct Callback Hotline Preview */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-blue-600" /> Facility Hotline:
            </span>
            <span className="font-bold text-slate-800">{hospitalName} Triage Desk</span>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? "Dispatching..." : "Dispatch Clinical Directive"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
