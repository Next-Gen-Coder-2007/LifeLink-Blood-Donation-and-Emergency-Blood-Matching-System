import { useState, useEffect } from "react";
import { Droplet, ArrowRight, ShieldCheck, Activity, Building2, HeartHandshake, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { MobileAppBanner } from "@/components/common/MobileAppBanner";
import { ProximityMapNetwork } from "@/components/common/ProximityMapNetwork";
import { useAuthModal } from "@/context/AuthModalContext";

const COMPATIBILITY: Record<string, { give: string[]; receive: string[] }> = {
  "O-": { give: ["All Groups (Universal Donor)"], receive: ["O-"] },
  "O+": { give: ["O+", "A+", "B+", "AB+"], receive: ["O-", "O+"] },
  "A-": { give: ["A-", "A+", "AB-", "AB+"], receive: ["O-", "A-"] },
  "A+": { give: ["A+", "AB+"], receive: ["O-", "O+", "A-", "A+"] },
  "B-": { give: ["B-", "B+", "AB-", "AB+"], receive: ["O-", "B-"] },
  "B+": { give: ["B+", "AB+"], receive: ["O-", "O+", "B-", "B+"] },
  "AB-": { give: ["AB-", "AB+"], receive: ["O-", "A-", "B-", "AB-"] },
  "AB+": { give: ["AB+"], receive: ["All Groups (Universal Recipient)"] },
};

export function LandingPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>("O-");
  const [stats, setStats] = useState({ totalUsers: 0, totalDonors: 0, totalHospitals: 0, totalRequests: 0 });
  const { openRegister } = useAuthModal();

  useEffect(() => {
    api.get<{ totalUsers: number; totalDonors: number; totalHospitals: number; totalRequests: number }>("/analytics/stats")
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/40 via-white to-slate-50 pt-16 pb-12">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1 text-xs font-semibold text-red-700 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Zero-Latency Emergency Blood Matching Platform
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Connecting Blood Donors <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">When Seconds Count.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            LifeLink synchronizes volunteer donors, hospital blood banks, and emergency triage requests into an intelligent real-time network.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => openRegister("donor")}
              className="flex h-11 items-center gap-2 rounded-xl bg-red-500 px-6 text-sm font-semibold text-white shadow-xs hover:bg-red-600 transition cursor-pointer"
            >
              Become a Donor
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => openRegister("hospital")}
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <Building2 className="h-4 w-4 text-slate-500" />
              Register Hospital
            </button>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-xs">
              <p className="text-2xl font-bold text-slate-900">{stats.totalDonors}</p>
              <p className="text-xs font-medium text-slate-500">Active Donors</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-xs">
              <p className="text-2xl font-bold text-slate-900">{stats.totalHospitals}</p>
              <p className="text-xs font-medium text-slate-500">Partner Hospitals</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-xs">
              <p className="text-2xl font-bold text-slate-900">{stats.totalRequests}</p>
              <p className="text-xs font-medium text-slate-500">Requests Handled</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-xs">
              <p className="text-2xl font-bold text-emerald-600">100%</p>
              <p className="text-xs font-medium text-slate-500">Verified Network</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">How LifeLink Works</h2>
          <p className="mt-2 text-sm text-slate-500">A seamless triage flow built for speed and precision.</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-bold text-slate-900">1. Emergency Broadcast</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Hospitals log urgent or emergency blood requirements with specific units and urgency tiers.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-bold text-slate-900">2. Proximity Matching</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Compatible donors in range receive instant alerts with facility hotlines and navigation coordinates.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-bold text-slate-900">3. Stock Fulfillment</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Live hospital inventories automatically replenish upon transfusion completion and verified receipt.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <ProximityMapNetwork />
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <MobileAppBanner />
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-slate-900">Blood Type Compatibility Matrix</h3>
            <p className="mt-1 text-xs text-slate-500">Select your blood group to see transfusion compatibility.</p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
            {Object.keys(COMPATIBILITY).map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`flex h-9 w-12 items-center justify-center rounded-xl text-xs font-bold transition ${
                  selectedGroup === group
                    ? "bg-red-500 text-white shadow-xs"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase">Can Donate To</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COMPATIBILITY[selectedGroup].give.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-800">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase">Can Receive From</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COMPATIBILITY[selectedGroup].receive.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-800">
                    <Droplet className="h-3 w-3 text-red-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
