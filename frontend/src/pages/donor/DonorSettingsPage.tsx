import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, ShieldCheck } from "lucide-react";
import { clearSession, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export function DonorSettingsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [alerts, setAlerts] = useState(true);

  const handleLogout = () => {
    clearSession();
    showToast("You have been signed out.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/donor/dashboard"
        title="Account Settings"
        description={`Preferences for ${session?.user.email || "user"}`}
      />

      <Card className="space-y-6">
        <CardHeader>
          <div>
            <CardTitle>System & Privacy Preferences</CardTitle>
            <CardDescription>Manage how hospitals and notifications interact with your profile</CardDescription>
          </div>
        </CardHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Emergency Notifications</p>
                <p className="text-xs text-slate-500">Receive priority alerts for compatible hospital requests</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={alerts}
              onChange={(e) => setAlerts(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-red-500 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Privacy & Security</p>
                <p className="text-xs text-slate-500">Coordinates are only shared with registered emergency hospitals</p>
              </div>
            </div>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Secured</span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign Out of Account
          </button>
        </div>
      </Card>
    </div>
  );
}
