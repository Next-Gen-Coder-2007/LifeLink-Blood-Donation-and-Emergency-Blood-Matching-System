import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Save, Phone, MapPin, LogOut, Lock, Mail, Navigation, AlertCircle } from "lucide-react";
import { api, getSession, clearSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export function HospitalSettingsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [hospitalId, setHospitalId] = useState("");
  const [form, setForm] = useState({
    hospital_name: "",
    email: "",
    phone: "",
    emergency_contact: "",
    address: "",
    latitude: 0,
    longitude: 0,
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || session.user.role !== "hospital") {
      navigate("/login");
      return;
    }

    const loadHospital = async () => {
      try {
        let current: any = null;
        try {
          current = await api.get(`/hospitals/user/${session.user.id}`);
        } catch {
          const hospitals = await api.get<any[]>("/hospitals");
          current = hospitals.find((h) => String(h.user_id) === String(session.user.id) || String(h.id) === String(session.user.profile_id));
        }

        if (current) {
          setHospitalId(current.id);
          setForm({
            hospital_name: current.hospital_name || session.user.name,
            email: session.user.email || "",
            phone: current.phone || "",
            emergency_contact: current.emergency_contact || "",
            address: current.address || "",
            latitude: current.latitude || 0,
            longitude: current.longitude || 0,
            password: "",
            confirm_password: "",
          });
        }
      } catch {
        showToast("Unable to load hospital settings", "error");
      } finally {
        setLoading(false);
      }
    };

    loadHospital();
  }, [session, navigate]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        showToast("GPS coordinates updated!");
      },
      () => {
        showToast("Could not retrieve GPS location", "error");
      }
    );
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password && form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.password && form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      // 1. Update user credentials if email, name or password changed
      const userUpdates: any = {
        name: form.hospital_name.trim(),
        email: form.email.trim(),
      };
      if (form.password) {
        userUpdates.password = form.password;
      }
      await api.put(`/users/${session?.user.id}`, userUpdates);

      // 2. Update hospital facility details
      if (hospitalId) {
        await api.put(`/hospitals/${hospitalId}`, {
          hospital_name: form.hospital_name.trim(),
          phone: form.phone.trim(),
          emergency_contact: form.emergency_contact.trim(),
          address: form.address.trim(),
          latitude: Number(form.latitude) || 0,
          longitude: Number(form.longitude) || 0,
        });
      }

      // 3. Update localStorage session user
      if (session) {
        session.user.name = form.hospital_name.trim();
        session.user.email = form.email.trim();
        localStorage.setItem("lifelink_session", JSON.stringify(session));
      }

      showToast("Hospital facility details updated successfully!");
      setForm((prev) => ({ ...prev, password: "", confirm_password: "" }));
    } catch (err: any) {
      setError(err?.message || "Failed to update hospital settings");
      showToast(err?.message || "Failed to update hospital settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    showToast("You have been signed out.");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mb-3" />
        <p>Loading hospital settings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/hospital/dashboard"
        title="Hospital Facility Settings"
        description="Manage medical facility profile, triage contacts, and account security"
      />

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Facility Details Card */}
        <Card className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle>Medical Center Profile</CardTitle>
              <CardDescription>Public facility details visible to donors responding to emergency broadcasts</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Facility / Hospital Name</label>
              <div className="mt-1 relative">
                <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.hospital_name}
                  onChange={(e) => setForm({ ...form, hospital_name: e.target.value })}
                  placeholder="e.g. Metro General Trauma Center"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition font-medium"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">Hospital Phone Hotline</label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 019-2834"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">24/7 Emergency Triage Contact</label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-red-500" />
                  <input
                    type="tel"
                    required
                    value={form.emergency_contact}
                    onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
                    placeholder="+1 (555) 911-0000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Physical Address & Location</label>
              <div className="mt-1 relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, City, State, ZIP"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition font-medium"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Geospatial Coordinates</p>
                  <p className="text-[11px] text-slate-500">Used by live donor radar and Haversine distance engine</p>
                </div>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 transition cursor-pointer shadow-2xs"
                >
                  <Navigation className="h-3.5 w-3.5 text-blue-600" />
                  Auto-Detect GPS
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Security & Credentials Card */}
        <Card className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle>Account Credentials & Security</CardTitle>
              <CardDescription>Manage your hospital portal login email and password</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Account Login Email</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition font-medium"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">Change Password (Optional)</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Confirm New Password</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={form.confirm_password}
                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/80 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out of Hospital Portal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Changes..." : "Save Hospital Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
