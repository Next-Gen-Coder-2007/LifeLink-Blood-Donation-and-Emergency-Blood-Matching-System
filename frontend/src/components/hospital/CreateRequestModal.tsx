import { useState, type FormEvent } from "react";
import { X, Send } from "lucide-react";

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    blood_group: string;
    units_required: number;
    urgency: "normal" | "urgent" | "emergency";
    patient_name: string;
  }) => Promise<void>;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function CreateRequestModal({ isOpen, onClose, onSubmit }: CreateRequestModalProps) {
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [units, setUnits] = useState(2);
  const [urgency, setUrgency] = useState<"normal" | "urgent" | "emergency">("urgent");
  const [patientName, setPatientName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        blood_group: bloodGroup,
        units_required: units,
        urgency,
        patient_name: patientName,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Broadcast Blood Request</h3>
            <p className="text-xs text-slate-500">Dispatch request to nearby compatible donors</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white"
              >
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Units Required</label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={units}
                onChange={(e) => setUnits(parseInt(e.target.value) || 1)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Triage Urgency</label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {(["normal", "urgent", "emergency"] as const).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setUrgency(level)}
                  className={`rounded-xl py-1.5 text-xs font-bold capitalize transition ${
                    urgency === level
                      ? level === "emergency"
                        ? "bg-red-500 text-white shadow-xs"
                        : level === "urgent"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-blue-600 text-white shadow-xs"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Patient Identifier / Case (Optional)</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. ICU Bed 2 / Trauma Alert"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-2/3 items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-600 disabled:opacity-50 transition"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? "Broadcasting..." : "Broadcast Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
