import { Plus, Minus, AlertCircle, Sparkles, Droplet } from "lucide-react";

interface BloodMatrixGridProps {
  stock: Record<string, number>;
  onUpdate: (group: string, newCount: number) => void;
  updatingGroup: string | null;
  readonly?: boolean;
  onBroadcastNeed?: (group: string) => void;
}

const BLOOD_GROUPS = [
  { group: "O-", label: "Universal Donor", optimal: 12, rh: "Rh-Negative" },
  { group: "O+", label: "Universal Red Cell", optimal: 15, rh: "Rh-Positive" },
  { group: "A-", label: "Rare Plasma Match", optimal: 8, rh: "Rh-Negative" },
  { group: "A+", label: "High Demand", optimal: 12, rh: "Rh-Positive" },
  { group: "B-", label: "Specialty Plasma", optimal: 6, rh: "Rh-Negative" },
  { group: "B+", label: "Routine Transfusion", optimal: 10, rh: "Rh-Positive" },
  { group: "AB-", label: "Universal Plasma", optimal: 4, rh: "Rh-Negative" },
  { group: "AB+", label: "Universal Recipient", optimal: 6, rh: "Rh-Positive" },
];

export function BloodMatrixGrid({
  stock,
  onUpdate,
  updatingGroup,
  readonly = false,
  onBroadcastNeed,
}: BloodMatrixGridProps) {
  return (
    <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {BLOOD_GROUPS.map(({ group, label, optimal, rh }) => {
        const count = stock[group] ?? 0;
        const isUpdating = updatingGroup === group;
        const percent = Math.min(100, Math.round((count / optimal) * 100));

        const isCritical = count === 0;
        const isLow = count > 0 && count < 3;

        return (
          <div
            key={group}
            className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-4 transition-all duration-200 shadow-xs hover:shadow-md ${
              isCritical
                ? "border-red-300 ring-1 ring-red-100/80 bg-linear-to-b from-red-50/30 to-white"
                : isLow
                ? "border-amber-200/90 bg-linear-to-b from-amber-50/20 to-white"
                : "border-slate-200/90 hover:border-slate-300"
            }`}
          >
            {/* Header: Blood Badge, RH indicator, and Stock Status */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl font-black text-sm shadow-2xs transition-transform group-hover:scale-105 ${
                      isCritical
                        ? "bg-red-600 text-white shadow-red-200"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {group}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {rh}
                    </span>
                    <span className="text-xs font-bold text-slate-800 leading-tight block">
                      {label}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      isCritical
                        ? "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                        : isLow
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {isCritical ? (
                      <>
                        <AlertCircle className="h-2.5 w-2.5" /> Deficit
                      </>
                    ) : isLow ? (
                      "Low Reserve"
                    ) : (
                      "Optimal"
                    )}
                  </span>
                </div>
              </div>

              {/* Units count & capacity bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {count}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      / {optimal} optimal units
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 font-mono">
                    {percent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isCritical
                        ? "bg-red-500"
                        : isLow
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.max(4, percent)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stepper controls and Quick Broadcast CTA */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {!readonly ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdate(group, Math.max(0, count - 1))}
                    disabled={isUpdating || count <= 0}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer active:scale-95 shadow-2xs"
                    title={`Decrement ${group}`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <span className="min-w-6 text-center text-xs font-bold text-slate-700">
                    {isUpdating ? "..." : count}
                  </span>

                  <button
                    type="button"
                    onClick={() => onUpdate(group, count + 1)}
                    disabled={isUpdating}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-30 transition cursor-pointer active:scale-95 shadow-2xs"
                    title={`Increment ${group}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Droplet className="h-3 w-3 text-red-500" /> Monitored Stock
                </div>
              )}

              {onBroadcastNeed && (count < 3 || isCritical) ? (
                <button
                  type="button"
                  onClick={() => onBroadcastNeed(group)}
                  className="inline-flex items-center gap-1 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 text-[11px] font-bold text-red-700 transition cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-red-600" />
                  Broadcast
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
