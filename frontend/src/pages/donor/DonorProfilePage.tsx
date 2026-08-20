import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { api, getSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

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
    availability: true,
    last_donation_date: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session || session.user.role !== "donor") {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const donors = await api.get<{ id: string; user_id: string; blood_group: string; phone: string; availability: boolean; last_donation_date?: string }[]>("/donors");
        const myProfile = donors.find((d) => String(d.user_id) === String(session.user.id));
        if (myProfile) {
          setDonorId(myProfile.id);
          setForm({
            name: session.user.name,
            email: session.user.email,
            phone: myProfile.phone || "",
            blood_group: myProfile.blood_group || "O+",
            availability: myProfile.availability ?? true,
            last_donation_date: myProfile.last_donation_date || "",
          });
        }
      } catch {
        showToast("Unable to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [session, navigate]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!donorId) return;
    setSaving(true);
    try {
      await api.put(`/donors/${donorId}`, {
        phone: form.phone,
        availability: form.availability,
        last_donation_date: form.last_donation_date || null,
      });
      showToast("Profile updated successfully!");
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading donor profile...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <PageHeader
        backTo="/donor/dashboard"
        title="Donor Profile"
        description="Manage your contact details and donation readiness"
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Keep your profile current for emergency proximity matches</CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSave} className="pt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                disabled
                value={form.name}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                disabled
                value={form.email}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Blood Group</label>
              <input
                type="text"
                disabled
                value={form.blood_group}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-red-600 font-bold cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Last Donation Date</label>
            <input
              type="date"
              value={form.last_donation_date}
              onChange={(e) => setForm({ ...form, last_donation_date: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200/80">
            <div>
              <p className="text-xs font-semibold text-slate-800">Donation Availability</p>
              <p className="text-[11px] text-slate-500">Allow hospitals to match you in emergency broadcasts</p>
            </div>
            <input
              type="checkbox"
              checked={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-red-500 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-600 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </form>
      </Card>
    </div>
  );
}
