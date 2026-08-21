import { useState } from "react";
import { ShieldCheck, Droplet, User } from "lucide-react";
import type { DonationPledgeItem } from "@/types";
import { Modal } from "@/components/ui/Modal";

interface VerifyDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pledge: DonationPledgeItem | null;
  onVerifySubmit: (pledgeId: string, units: number, remarks: string) => Promise<void>;
}

export function VerifyDonationModal({
  isOpen,
  onClose,
  pledge,
  onVerifySubmit,
}: VerifyDonationModalProps) {
  const [units, setUnits] = useState(1);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!pledge) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onVerifySubmit(
        pledge.id,
        Number(units) || 1,
        remarks.trim() || `Verified donation of ${units} unit(s) of ${pledge.blood_group} blood.`
      );
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
      icon={<ShieldCheck className="h-6 w-6 text-emerald-600" />}
      title="Verify & Complete Donation"
      description="Record collected units, issue official LifeLink digital certificate & replenish hospital stock"
    >
      {/* Donor Summary Card */}
      <div className="mb-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-900">{pledge.donor_name}</span>
          </div>
          <span className="flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-extrabold text-red-700">
            <Droplet className="h-3 w-3" />
            {pledge.blood_group}
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Contact Phone: <span className="font-semibold text-slate-800">{pledge.donor_phone}</span>
        </p>
        <p className="text-xs text-slate-500">
          Pledge arrival info: <span className="font-semibold text-slate-800">{pledge.estimated_arrival}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Collected Units (Whole Blood / Packed Cells)
          </label>
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setUnits(num)}
                className={`flex-1 rounded-xl py-2.5 text-xs font-extrabold transition border cursor-pointer ${
                  units === num
                    ? "bg-red-500 border-red-500 text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {num} Unit{num > 1 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Clinical Notes & Transfusion Remarks
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Hemoglobin screened, safe transfusion units logged in facility refrigeration..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-red-500 focus:outline-none resize-none"
          />
        </div>

        <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-100 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-800">
            Upon confirmation, your blood stock for <b>{pledge.blood_group}</b> will increase by <b>{units} unit(s)</b> and a verified LifeLink Certificate of Appreciation will be issued to {pledge.donor_name}.
          </p>
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
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            {submitting ? "Verifying..." : "Verify & Issue Certificate"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
