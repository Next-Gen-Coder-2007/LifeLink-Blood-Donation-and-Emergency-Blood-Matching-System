import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Droplet, Building2, MapPin, ArrowRight } from "lucide-react";
import { api, setSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { Modal } from "@/components/ui/Modal";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function RegisterModal() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { modalType, registerTab, closeModals, openLogin, openRegister } = useAuthModal();

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

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

  const handleLocateDonor = () => {
    if (!("geolocation" in navigator)) {
      showToast("Geolocation not supported by this browser", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDonorForm((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(5)),
          longitude: Number(pos.coords.longitude.toFixed(5)),
        }));
        setLocating(false);
        showToast("GPS coordinates synchronized!");
      },
      () => {
        setLocating(false);
        showToast("Unable to fetch location automatically", "error");
      },
      { timeout: 8000 }
    );
  };

  const handleLocateHospital = () => {
    if (!("geolocation" in navigator)) {
      showToast("Geolocation not supported by this browser", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHospForm((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(5)),
          longitude: Number(pos.coords.longitude.toFixed(5)),
        }));
        setLocating(false);
        showToast("Hospital coordinates calibrated!");
      },
      () => {
        setLocating(false);
        showToast("Unable to fetch location automatically", "error");
      },
      { timeout: 8000 }
    );
  };

  const handleDonorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create base user account
      const userRes = await api.post<{ user_id: string }>("/register", {
        name: donorForm.name,
        email: donorForm.email,
        password: donorForm.password,
        role: "donor",
      });

      // 2. Create donor profile
      await api.post(`/donors/user/${userRes.user_id}`, {
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
        blood_group: donorForm.blood_group,
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
    setLoading(true);

    try {
      // 1. Create base user account
      const userRes = await api.post<{ user_id: string }>("/register", {
        name: hospForm.name,
        email: hospForm.email,
        password: hospForm.password,
        role: "hospital",
      });

      // 2. Create hospital facility profile
      await api.post(`/hospitals/user/${userRes.user_id}`, {
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
    <Modal isOpen={isOpen} onClose={closeModals} size="lg" className="max-h-[90vh] overflow-y-auto">
      <div className="flex rounded-2xl bg-slate-100/80 p-1 mb-6">
        <button
          type="button"
          onClick={() => openRegister("donor")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
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
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
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
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
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
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
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
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Phone Hotline</label>
                <input
                  type="tel"
                  required
                  value={donorForm.phone}
                  onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Blood Type</label>
                <select
                  value={donorForm.blood_group}
                  onChange={(e) => setDonorForm({ ...donorForm, blood_group: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={donorForm.availability}
                  onChange={(e) => setDonorForm({ ...donorForm, availability: e.target.checked })}
                  className="h-4 w-4 rounded text-red-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="availCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Available for Emergency Transfusions
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-red-500" />
                  Donor Coordinates (GPS Radar)
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {donorForm.latitude}, {donorForm.longitude}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLocateDonor}
                disabled={locating}
                className="w-full rounded-xl border border-slate-300 bg-white py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                {locating ? "Acquiring GPS..." : "Auto-Calibrate My Location"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-xs font-bold text-white shadow-xs hover:bg-red-600 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? "Registering Donor..." : "Complete Donor Registration"}
              {!loading && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </form>
        </div>
      ) : (
        <div>
          <div className="text-center mb-5">
            <h2 className="text-lg font-bold text-slate-900">Register Medical Facility</h2>
            <p className="text-xs text-slate-500 mt-0.5">Connect your hospital blood bank to dispatch emergency donor broadcasts</p>
          </div>

          <form onSubmit={handleHospitalSubmit} className="space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Official Hospital Name</label>
                <input
                  type="text"
                  required
                  value={hospForm.hospital_name}
                  onChange={(e) => setHospForm({ ...hospForm, hospital_name: e.target.value })}
                  placeholder="Metro General Hospital"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Staff Admin Name</label>
                <input
                  type="text"
                  required
                  value={hospForm.name}
                  onChange={(e) => setHospForm({ ...hospForm, name: e.target.value })}
                  placeholder="Dr. Sarah Jenkins"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Official Facility Email</label>
                <input
                  type="email"
                  required
                  value={hospForm.email}
                  onChange={(e) => setHospForm({ ...hospForm, email: e.target.value })}
                  placeholder="bloodbank@metrohospital.org"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Portal Password</label>
                <input
                  type="password"
                  required
                  value={hospForm.password}
                  onChange={(e) => setHospForm({ ...hospForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Primary Phone</label>
                <input
                  type="tel"
                  required
                  value={hospForm.phone}
                  onChange={(e) => setHospForm({ ...hospForm, phone: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Emergency Hotline</label>
                <input
                  type="tel"
                  required
                  value={hospForm.emergency_contact}
                  onChange={(e) => setHospForm({ ...hospForm, emergency_contact: e.target.value })}
                  placeholder="+1 (555) 999-EMER"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Physical Facility Address</label>
              <input
                type="text"
                required
                value={hospForm.address}
                onChange={(e) => setHospForm({ ...hospForm, address: e.target.value })}
                placeholder="100 Medical Center Blvd, Suite 400"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none transition shadow-2xs"
              />
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  Facility Coordinates
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {hospForm.latitude}, {hospForm.longitude}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLocateHospital}
                disabled={locating}
                className="w-full rounded-xl border border-slate-300 bg-white py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                {locating ? "Locating..." : "Auto Detect Coordinates"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
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
          className="font-bold text-slate-900 hover:underline cursor-pointer"
        >
          Sign In to Dashboard
        </button>
      </div>
    </Modal>
  );
}
