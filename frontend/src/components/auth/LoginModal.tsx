import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { X, Droplet, Lock, Mail, ArrowRight } from "lucide-react";
import { api, setSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useAuthModal } from "@/context/AuthModalContext";

export function LoginModal() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { modalType, closeModals, openRegister } = useAuthModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isOpen = modalType === "login";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeModals();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModals]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter your email and password.", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await api.post<{
        message: string;
        user_id: string;
        name: string;
        email: string;
        role: "donor" | "hospital" | "admin";
      }>("/login", { email, password });

      setSession(data);
      showToast(`Welcome back, ${data.name.split(" ")[0]}!`);
      closeModals();

      if (data.role === "hospital") {
        navigate("/hospital/dashboard");
      } else if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/donor/dashboard");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModals();
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 sm:p-8 shadow-2xl border border-slate-100">
        <button
          type="button"
          onClick={closeModals}
          className="absolute right-5 top-5 rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="Close Modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-xs">
            <Droplet className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900 tracking-tight">Sign in to LifeLink</h2>
          <p className="mt-1 text-xs text-slate-500">Access your donor, hospital, or admin command center</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-bold text-white shadow-xs hover:bg-red-600 disabled:opacity-50 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => openRegister("donor")}
            className="font-bold text-red-600 hover:underline"
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}
