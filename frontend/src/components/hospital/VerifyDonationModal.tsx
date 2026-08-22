import { useState, useEffect } from "react";
import { ShieldCheck, Droplet, User, Plus, Minus, AlertCircle } from "lucide-react";
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
  const [units, setUnits] = useState<number | string>(1);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUnits(1);
      setRemarks("");
      setValidationError(null);
    }
  }, [isOpen]);

  if (!pledge) return null;

  const handleUnitsChange = (val: string | number) => {
    setUnits(val);
    const num = Number(val);
    if (!val || isNaN(num) || num <= 0) {
      setValidationError("Units collected must be greater than 0");
    } else {
      setValidationError(null);
    }
  };

  const handleIncrement = () => {
    const current = Number(units) || 0;
    handleUnitsChange(current + 1);
  };

  const handleDecrement = () => {
    const current = Number(units) || 1;
    if (current > 1) {
      handleUnitsChange(current - 1);
    }
  };

  const parsedUnits = Math.max(1, Number(units) || 1);
  const isValid = Number(units) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!units || Number(units) <= 0) {
      setValidationError("Units collected must be greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      await onVerifySubmit(
        pledge.id,
        parsedUnits,
        remarks.trim() || `Verified donation of ${parsedUnits} unit(s) of ${pledge.blood_group} blood.`
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
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Collected Units (Whole Blood / Packed Cells)
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Direct Number Input with Stepper Buttons */}
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/70 p-1 shadow-2xs focus-within:border-red-500 focus-within:bg-white transition flex-1">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={Number(units) <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer shadow-2xs"
                title="Decrease units"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <input
                type="number"
                min="1"
                step="1"
                required
                value={units}
                onChange={(e) => handleUnitsChange(e.target.value)}
                placeholder="1"
                className="w-full bg-transparent px-3 text-center text-sm font-black text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                type="button"
                onClick={handleIncrement}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                title="Increase units"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleUnitsChange(preset)}
                  className={`flex-1 sm:flex-initial rounded-xl px-3 py-2 text-xs font-black transition border cursor-pointer ${
                    Number(units) === preset
                      ? "bg-red-500 border-red-500 text-white shadow-2xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {preset} {preset === 1 ? "Unit" : "Units"}
                </button>
              ))}
            </div>
          </div>

          {validationError && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {validationError}
            </p>
          )}
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
            Upon confirmation, your blood stock for <b>{pledge.blood_group}</b> will increase by <b>{parsedUnits} unit(s)</b> and a verified LifeLink Certificate of Appreciation will be issued to {pledge.donor_name}.
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
            disabled={submitting || !isValid}
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
