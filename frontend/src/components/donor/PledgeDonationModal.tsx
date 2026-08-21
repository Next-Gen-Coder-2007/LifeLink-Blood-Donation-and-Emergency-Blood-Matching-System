import { useState } from "react";
import { HeartHandshake, Clock, MapPin, Building2, AlertCircle } from "lucide-react";
import type { DonorRequestItem } from "@/components/donor/DonorRequestCard";
import { Modal } from "@/components/ui/Modal";

interface PledgeDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DonorRequestItem | null;
  onPledgeSubmit: (data: { estimated_arrival: string; notes: string }) => Promise<void>;
}

export function PledgeDonationModal({
  isOpen,
  onClose,
  request,
  onPledgeSubmit,
}: PledgeDonationModalProps) {
  const [estimatedArrival, setEstimatedArrival] = useState("Within 1 hour");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onPledgeSubmit({
        estimated_arrival: estimatedArrival,
        notes: notes.trim(),
      });
      onClose();
    } catch {
      // Error handled by parent toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      icon={<HeartHandshake className="h-6 w-6 text-red-600" />}
      title="Pledge Blood Donation"
      description="Confirm your commitment to donate for this critical hospital broadcast"
    >
      {/* Hospital & Request Summary Card */}
      <div className="mb-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-900">{request.hospital_name}</span>
          </div>
          <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-extrabold text-red-700">
            {request.blood_group} ({request.units_required} Units)
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          {request.hospital_address}
        </p>

        <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2 mt-2 border border-amber-100">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>The hospital clinical team will receive your pledge details and prepare for your arrival.</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Estimated Time of Arrival (ETA)
          </label>
          <div className="relative">
            <select
              value={estimatedArrival}
              onChange={(e) => setEstimatedArrival(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs focus:border-red-500 focus:outline-none"
            >
              <option value="Within 30 minutes">Within 30 minutes (Urgent)</option>
              <option value="Within 1 hour">Within 1 hour</option>
              <option value="Within 2 hours">Within 2 hours</option>
              <option value="Today afternoon">Today afternoon</option>
              <option value="Today evening">Today evening</option>
            </select>
            <Clock className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Notes or Message for Hospital (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. On my way by cab, reaching facility reception counter..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-red-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition disabled:opacity-50 cursor-pointer"
          >
            <HeartHandshake className="h-4 w-4" />
            {submitting ? "Pledging..." : "Confirm & Pledge to Donate"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
