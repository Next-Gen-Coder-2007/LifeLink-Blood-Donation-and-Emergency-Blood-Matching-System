import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { X, Droplet, Building2, MapPin, ArrowRight } from "lucide-react";
import { api, setSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useAuthModal } from "@/context/AuthModalContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function RegisterModal() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { modalType, registerTab, closeModals, openLogin, openRegister } = useAuthModal();

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  // Donor form
  const [donorForm, setDonorForm] = useState({
    name: "",
    email: "",
    password: "",
    blood_group: "O+",
    phone: "",
    latitude: 40.7128,
    longitude: -74.006,
    availability: true,
  });

  // Hospital form
  const [hospForm, setHospForm] = useState({
    name: "",
    email: "",
    password: "",
    hospital_name: "",
    phone: "",
    emergency_contact: "",
    address: "",
    latitude: 40.7128,
    longitude: -74.006,
  });

  const isOpen = modalType === "register";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeModals();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModals]);

  if (!isOpen) return null;

  const detectLocation = (type: "donor" | "hospital") => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (type === "donor") {
          setDonorForm((prev) => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        } else {
          setHospForm((prev) => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        }
        showToast("Location detected successfully!");
        setLocating(false);
      },
      () => {
        showToast("Unable to retrieve location. Defaulting coordinates.", "info");
        setLocating(false);
      }
    );
  };

  const handleDonorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!donorForm.name || !donorForm.email || !donorForm.password || !donorForm.phone) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setLoading(true);
    try {
      const userRes = await api.post<{ user_id: string }>("/users", {
        name: donorForm.name,
        email: donorForm.email,
        password_hash: donorForm.password,
        role: "donor",
      });

      await api.post(`/users/${userRes.user_id}/donor`, {
        blood_group: donorForm.blood_group,
        phone: donorForm.phone,
        latitude: donorForm.latitude,
        longitude: donorForm.longitude,
        availability: donorForm.availability,
      });

      setSession({
        user_id: userRes.user_id,
        name: donorForm.name,
        email: donorForm.email,
        role: "donor",
      });

      showToast("Donor registration successful!");
      closeModals();
      navigate("/donor/dashboard");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hospForm.name || !hospForm.email || !hospForm.password || !hospForm.hospital_name || !hospForm.phone || !hospForm.emergency_contact || !hospForm.address) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setLoading(true);
    try {
      const userRes = await api.post<{ user_id: string }>("/users", {
        name: hospForm.name,
        email: hospForm.email,
        password_hash: hospForm.password,
        role: "hospital",
      });

      await api.post(`/users/${userRes.user_id}/hospital`, {
        hospital_name: hospForm.hospital_name,
        phone: hospForm.phone,
        emergency_contact: hospForm.emergency_contact,
        address: hospForm.address,
        latitude: hospForm.latitude,
        longitude: hospForm.longitude,
      });

      setSession({
        user_id: userRes.user_id,
        name: hospForm.name,
        email: hospForm.email,
        role: "hospital",
      });

      showToast("Hospital registration successful!");
      closeModals();
      navigate("/hospital/dashboard");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModals();
      }}
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        <button
          type="button"
          onClick={closeModals}
          className="absolute right-5 top-5 rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="Close Modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex rounded-2xl bg-slate-100/80 p-1 mb-6">
          <button
            type="button"
            onClick={() => openRegister("donor")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${
              registerTab === "donor"
                ? "bg-white text-red-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Droplet className="h-3.5 w-3.5" />
            Volunteer Donor
          </button>
          <button
            type="button"
            onClick={() => openRegister("hospital")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition ${
              registerTab === "hospital"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Hospital / Blood Bank
          </button>
        </div>

        {registerTab === "donor" ? (
          <div>
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-slate-900">Create Volunteer Donor Account</h2>
              <p className="text-xs text-slate-500 mt-0.5">Receive priority matching alerts when local hospitals broadcast your blood group</p>
            </div>

            <form onSubmit={handleDonorSubmit} className="space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={donorForm.name}
                    onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={donorForm.email}
                    onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                    placeholder="john@example.com"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <input
                    type="password"
                    required
                    value={donorForm.password}
                    onChange={(e) => setDonorForm({ ...donorForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={donorForm.phone}
                    onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                    placeholder="+1 555 0192"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Blood Group</label>
                <select
                  value={donorForm.blood_group}
                  onChange={(e) => setDonorForm({ ...donorForm, blood_group: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition"
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-mono">
                  GPS: {donorForm.latitude.toFixed(4)}, {donorForm.longitude.toFixed(4)}
                </span>
                <button
                  type="button"
                  onClick={() => detectLocation("donor")}
                  disabled={locating}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                >
                  <MapPin className="h-3 w-3 text-red-500" />
                  {locating ? "Locating..." : "Auto Detect Coordinates"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-xs font-bold text-white shadow-xs hover:bg-red-600 disabled:opacity-50 transition"
              >
                {loading ? "Creating Profile..." : "Complete Donor Registration"}
                {!loading && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-slate-900">Hospital Facility Registration</h2>
              <p className="text-xs text-slate-500 mt-0.5">Connect your hospital to manage 8-group stock and broadcast emergency requests</p>
            </div>

            <form onSubmit={handleHospitalSubmit} className="space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Representative Name</label>
                  <input
                    type="text"
                    required
                    value={hospForm.name}
                    onChange={(e) => setHospForm({ ...hospForm, name: e.target.value })}
                    placeholder="Dr. Sarah Johnson"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Official Hospital Name</label>
                  <input
                    type="text"
                    required
                    value={hospForm.hospital_name}
                    onChange={(e) => setHospForm({ ...hospForm, hospital_name: e.target.value })}
                    placeholder="City General Hospital"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Official Email</label>
                  <input
                    type="email"
                    required
                    value={hospForm.email}
                    onChange={(e) => setHospForm({ ...hospForm, email: e.target.value })}
                    placeholder="admin@hospital.org"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <input
                    type="password"
                    required
                    value={hospForm.password}
                    onChange={(e) => setHospForm({ ...hospForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Main Phone</label>
                  <input
                    type="tel"
                    required
                    value={hospForm.phone}
                    onChange={(e) => setHospForm({ ...hospForm, phone: e.target.value })}
                    placeholder="+1 555 0100"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">24/7 Emergency Hotline</label>
                  <input
                    type="tel"
                    required
                    value={hospForm.emergency_contact}
                    onChange={(e) => setHospForm({ ...hospForm, emergency_contact: e.target.value })}
                    placeholder="+1 555 0911"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Physical Address</label>
                <input
                  type="text"
                  required
                  value={hospForm.address}
                  onChange={(e) => setHospForm({ ...hospForm, address: e.target.value })}
                  placeholder="123 Health Ave, Medical District"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-mono">
                  GPS: {hospForm.latitude.toFixed(4)}, {hospForm.longitude.toFixed(4)}
                </span>
                <button
                  type="button"
                  onClick={() => detectLocation("hospital")}
                  disabled={locating}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                >
                  <MapPin className="h-3 w-3 text-blue-600" />
                  {locating ? "Locating..." : "Auto Detect Coordinates"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? "Registering Hospital..." : "Complete Hospital Registration"}
                {!loading && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </form>
          </div>
        )}

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={openLogin}
            className="font-bold text-slate-900 hover:underline"
          >
            Sign In to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
