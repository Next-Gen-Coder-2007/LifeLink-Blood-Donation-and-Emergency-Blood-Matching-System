import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Mail, ArrowRight } from "lucide-react";
import { api, setSession } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post<{
        user_id: string;
        name: string;
        email: string;
        role: "donor" | "hospital" | "admin";
      }>("/login", { email, password });

      if (data.role !== "admin") {
        throw new Error("Unauthorized: Administrator credentials required");
      }

      setSession(data);
      showToast("Administrator authenticated successfully!");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs">
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Admin Control Center</h1>
          <p className="mt-1 text-xs text-slate-500">System administration and database management</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Admin Email</label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lifelink.org"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Master Password</label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition"
          >
            {loading ? "Authenticating..." : "Authenticate"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
