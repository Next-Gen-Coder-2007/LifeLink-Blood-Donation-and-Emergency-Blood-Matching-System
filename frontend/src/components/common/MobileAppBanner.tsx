import { Smartphone, BellRing, MapPin, Zap, CheckCircle2 } from "lucide-react";

export function MobileAppBanner() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-md sm:p-8">
      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-300">
            <Smartphone className="h-3.5 w-3.5" />
            Coming in Phase 1: Native Mobile Edition
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            LifeLink Mobile App for iOS & Android
          </h2>

          <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
            Carry the emergency blood matching network in your pocket. Features real-time high-priority push notifications, background proximity GPS matching, and offline-first blood donor records.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <BellRing className="h-4 w-4 text-red-400 shrink-0" />
              <span>Priority Push Alerts</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
              <span>10km GPS Radar</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <Zap className="h-4 w-4 text-amber-400 shrink-0" />
              <span>1-Tap SOS Dispatch</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Offline SQLite Cache</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 border border-white/10 p-6 text-center backdrop-blur-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400">
            <Smartphone className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-bold text-white">Cross-Platform React Native App</p>
          <p className="mt-1 text-xs text-slate-400">Built with Expo & Firebase Cloud Messaging</p>
          <span className="mt-4 inline-flex items-center rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
            Architecture Ready for Mobile Build
          </span>
        </div>
      </div>
    </div>
  );
}
