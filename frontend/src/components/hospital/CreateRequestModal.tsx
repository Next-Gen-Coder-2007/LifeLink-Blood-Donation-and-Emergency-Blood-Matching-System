import { useState, useEffect, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    blood_group: string;
    units_required: number;
    urgency: "normal" | "urgent" | "emergency";
    patient_name: string;
  }) => Promise<void>;
  initialBloodGroup?: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function CreateRequestModal({ isOpen, onClose, onSubmit, initialBloodGroup }: CreateRequestModalProps) {
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [units, setUnits] = useState(2);
  const [urgency, setUrgency] = useState<"normal" | "urgent" | "emergency">("urgent");
  const [patientName, setPatientName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialBloodGroup && BLOOD_GROUPS.includes(initialBloodGroup)) {
      setBloodGroup(initialBloodGroup);
    }
  }, [initialBloodGroup, isOpen]);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Broadcast Blood Request"
      description="Dispatch emergency blood requirements directly to matching local donors"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
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
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Triage Priority Level</label>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {(["normal", "urgent", "emergency"] as const).map((level) => (
              <button
                type="button"
                key={level}
                onClick={() => setUrgency(level)}
                className={`rounded-xl py-2 text-xs font-bold capitalize transition cursor-pointer ${
                  urgency === level
                    ? level === "emergency"
                      ? "bg-red-500 text-white shadow-xs"
                      : level === "urgent"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-blue-600 text-white shadow-xs"
                    : "border border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Patient Identifier (Optional)</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="e.g. ICU Ward 3 / Patient #408"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-bold text-white shadow-xs hover:bg-red-600 disabled:opacity-50 transition cursor-pointer"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Broadcasting Request..." : "Broadcast Emergency Request"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
