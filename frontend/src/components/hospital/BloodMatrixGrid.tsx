import { Plus, Minus } from "lucide-react";

interface BloodMatrixGridProps {
  stock: Record<string, number>;
  onUpdate: (group: string, newCount: number) => void;
  updatingGroup: string | null;
  readonly?: boolean;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function BloodMatrixGrid({ stock, onUpdate, updatingGroup, readonly = false }: BloodMatrixGridProps) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
      {BLOOD_GROUPS.map((group) => {
        const count = stock[group] ?? 0;
        const isUpdating = updatingGroup === group;

        return (
          <div
            key={group}
            className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-900 shadow-2xs">
                {group}
              </span>
              <span
                className={`text-xs font-bold ${
                  count === 0 ? "text-red-500" : count < 3 ? "text-amber-500" : "text-emerald-600"
                }`}
              >
                {count === 0 ? "Empty" : count < 3 ? "Low" : "Stocked"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                {count} <span className="text-xs font-normal text-slate-400">units</span>
              </span>

              {!readonly && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdate(group, Math.max(0, count - 1))}
                    disabled={isUpdating || count <= 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdate(group, count + 1)}
                    disabled={isUpdating}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
