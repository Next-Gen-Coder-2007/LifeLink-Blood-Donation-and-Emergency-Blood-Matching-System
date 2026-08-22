import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Save, User, Mail, Phone, MapPin, Calendar, Heart, Lock, AlertCircle, LogOut } from "lucide-react";
import { api, getSession, clearSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

const ALL_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function DonorProfilePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const session = getSession();

  const [donorId, setDonorId] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    blood_group: "O+",
    address: "",
    availability: true,
    last_donation_date: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || session.user.role !== "donor") {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const myProfile = await api.get<{
          id: string;
          phone?: string;
          blood_group?: string;
          address?: string;
          availability?: boolean;
          last_donation_date?: string;
        }>(`/donors/user/${session.user.id}`);

        if (myProfile) {
          setDonorId(myProfile.id);
          setForm({
            name: session.user.name || "",
            email: session.user.email || "",
            phone: myProfile.phone || "",
            blood_group: myProfile.blood_group || "O+",
            address: myProfile.address || "",
            availability: myProfile.availability ?? true,
            last_donation_date: myProfile.last_donation_date || "",
            password: "",
            confirm_password: "",
          });
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Unable to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [session?.user?.id, session?.user?.role, navigate]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password && form.password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (form.password && form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      // 1. Update user credentials
      const userUpdates: any = {
        name: form.name.trim(),
        email: form.email.trim(),
      };
      if (form.password) {
        userUpdates.password = form.password;
      }
      await api.put(`/users/${session?.user.id}`, userUpdates);

      // 2. Update donor profile
      if (donorId) {
        await api.put(`/donors/${donorId}`, {
          phone: form.phone.trim(),
          blood_group: form.blood_group,
          address: form.address.trim(),
          availability: form.availability,
          last_donation_date: form.last_donation_date || null,
        });
      }

      // 3. Update active session state
      if (session) {
        session.user.name = form.name.trim();
        session.user.email = form.email.trim();
        session.user.blood_group = form.blood_group;
        localStorage.setItem("lifelink_session", JSON.stringify(session));
      }

      showToast("Profile and account details updated successfully!");
      setForm((prev) => ({ ...prev, password: "", confirm_password: "" }));
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
      showToast(err?.message || "Failed to update profile", "error");
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
      <div className="py-20 text-center text-xs text-slate-500">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-500 mb-3" />
        <p>Loading donor profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/donor/dashboard"
        title="Donor Profile & Account Settings"
        description="Manage your medical donor details, contact info, and security credentials"
      />

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Personal & Donor Info Card */}
        <Card className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle>Personal & Medical Details</CardTitle>
              <CardDescription>Keep your profile current for emergency ABO/Rh proximity matches</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">Full Name</label>
                <div className="mt-1 relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Blood Group</label>
                <div className="mt-1 relative">
                  <Heart className="absolute left-3.5 top-3 h-4 w-4 text-red-500" />
                  <select
                    value={form.blood_group}
                    onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm font-bold text-red-600 focus:border-red-500 focus:bg-white focus:outline-none transition cursor-pointer"
                  >
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg} Blood Type
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">Phone Number</label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Last Donation Date</label>
                <div className="mt-1 relative">
                  <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={form.last_donation_date}
                    onChange={(e) => setForm({ ...form, last_donation_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none transition font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Address / City Area</label>
              <div className="mt-1 relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, City, State, ZIP"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none transition font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
              <div>
                <p className="text-xs font-bold text-slate-800">Donation Availability Status</p>
                <p className="text-[11px] text-slate-500">Allow hospitals to match and notify you during emergency blood broadcasts</p>
              </div>
              <input
                type="checkbox"
                checked={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-red-500 focus:ring-red-500 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Security & Credentials Card */}
        <Card className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle>Account Credentials & Password</CardTitle>
              <CardDescription>Manage your LifeLink donor sign-in credentials</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Login Email Address</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none transition font-medium"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Confirm Password</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={form.confirm_password}
                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none transition font-medium"
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
            Sign Out of Account
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-600 transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Changes..." : "Save Donor Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
