import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  LogIn,
  ShieldCheck,
  User,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    // Temporary fixed admin credentials
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "admin123";

    if (
      username.trim() === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD
    ) {
      const adminSession = {
        name: "Administrator",
        username: ADMIN_USERNAME,
        email: "admin@lifelink.com",
        role: "admin",
      };

      localStorage.setItem(
        "lifelink_admin",
        JSON.stringify(adminSession)
      );

      showToast("Admin login successful.", "success");

      navigate("/admin/dashboard", { replace: true });
      return;
    }

    showToast("Invalid admin username or password.", "error");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">

      {/* Header */}
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
          <Logo to="/" />
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">

        <div className="w-full max-w-md">

          {/* Admin Icon */}
          <div className="mb-6 flex justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <ShieldCheck className="h-8 w-8" />
            </span>
          </div>

          {/* Heading */}
          <div className="text-center">
            <p className="text-sm font-medium text-primary">
              LifeLink Administration
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-muted">
              Sign in to access the LifeLink administration dashboard.
            </p>
          </div>

          {/* Login Card */}
          <div className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Username
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border border-line bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-line bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                <LogIn className="h-4 w-4" aria-hidden />
                {loading ? "Signing in..." : "Sign in as Admin"}
              </Button>

            </form>

            {/* Temporary Credentials */}
            <div className="mt-6 rounded-2xl bg-primary-soft p-4">

              <p className="text-xs font-semibold text-primary">
                Development Credentials
              </p>

              <div className="mt-2 space-y-1 text-xs text-muted">
                <p>
                  Username:{" "}
                  <span className="font-semibold text-foreground">
                    admin
                  </span>
                </p>

                <p>
                  Password:{" "}
                  <span className="font-semibold text-foreground">
                    admin123
                  </span>
                </p>
              </div>

            </div>

          </div>

          {/* Back */}
          <p className="mt-6 text-center text-sm text-muted">
            This is a temporary development admin login.
          </p>

        </div>

      </main>
    </div>
  );
}