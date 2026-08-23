import { Plus, Minus, AlertCircle, Sparkles, ThermometerSnowflake } from "lucide-react";

interface BloodMatrixGridProps {
  stock: Record<string, number>;
  onUpdate?: (group: string, newCount: number) => void;
  updatingGroup?: string | null;
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
  updatingGroup = null,
  readonly = false,
  onBroadcastNeed,
}: BloodMatrixGridProps) {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {BLOOD_GROUPS.map(({ group, label, optimal, rh }) => {
        const count = stock[group] ?? 0;
        const isUpdating = updatingGroup === group;
        const percent = Math.min(100, Math.round((count / optimal) * 100));

        const isCritical = count === 0;
        const isLow = count > 0 && count < 3;

        return (
          <div
            key={group}
            className={`group relative flex flex-col justify-between rounded-xl border bg-white p-3.5 transition-all duration-150 shadow-2xs hover:shadow-xs ${
              isCritical
                ? "border-red-200 bg-red-50/20"
                : isLow
                ? "border-slate-300"
                : "border-slate-200"
            }`}
          >
            {/* Header: Blood Badge, RH indicator, and Stock Status */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg font-black text-xs shadow-2xs ${
                      isCritical
                        ? "bg-red-600 text-white"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {group}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                      {rh}
                    </span>
                    <span className="text-xs font-bold text-slate-800 leading-tight block">
                      {label}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      isCritical
                        ? "bg-red-100 text-red-700"
                        : isLow
                        ? "bg-slate-100 text-slate-700"
                        : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    {isCritical ? (
                      <>
                        <AlertCircle className="h-2.5 w-2.5" /> Deficit
                      </>
                    ) : isLow ? (
                      "Low Stock"
                    ) : (
                      "Optimal"
                    )}
                  </span>
                </div>
              </div>

              {/* Units count & capacity bar */}
              <div className="mt-3 space-y-1">
                <div className="flex items-baseline justify-between text-xs">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900 tracking-tight">
                      {count}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      / {optimal} units
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">
                    {percent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isCritical
                        ? "bg-red-600"
                        : isLow
                        ? "bg-slate-400"
                        : "bg-red-600"
                    }`}
                    style={{ width: `${Math.max(4, percent)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stepper controls (if not readonly) OR Clinical Telemetry Badge (if readonly) */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
              {!readonly && onUpdate ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdate(group, Math.max(0, count - 1))}
                    disabled={isUpdating || count <= 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer shadow-2xs"
                    title={`Decrement ${group}`}
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <span className="min-w-5 text-center text-xs font-bold text-slate-700">
                    {isUpdating ? "..." : count}
                  </span>

                  <button
                    type="button"
                    onClick={() => onUpdate(group, count + 1)}
                    disabled={isUpdating}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                    title={`Increment ${group}`}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                  <ThermometerSnowflake className="h-3 w-3 text-red-600" />
                  <span>3.8°C Monitored</span>
                </div>
              )}

              {onBroadcastNeed && (count < 3 || isCritical) ? (
                <button
                  type="button"
                  onClick={() => onBroadcastNeed(group)}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-red-700 transition cursor-pointer shadow-2xs"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  Broadcast
                </button>
              ) : readonly ? (
                <span className="text-[10px] font-semibold text-slate-400">
                  {count} Avail
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
