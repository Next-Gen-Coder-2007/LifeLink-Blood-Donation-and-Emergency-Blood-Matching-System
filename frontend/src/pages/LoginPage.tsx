import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, Droplet, Lock, Mail } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";
import { LoadingButton } from "@/components/LoadingButton";
import { isValidEmail } from "@/lib/validation";
import { useToast } from "@/context/ToastContext";

interface LoginErrors {
  email?: string;
  password?: string;
}

const ROLE_PRESETS = [
  {
    role: "Donor" as const,
    email: "donor@lifelink.com",
    icon: Droplet,
    className: "text-red-500 bg-red-50 hover:bg-red-500 hover:text-white",
  },
  {
    role: "Hospital" as const,
    email: "hospital@lifelink.com",
    icon: Building2,
    className: "text-primary bg-primary-soft hover:bg-primary hover:text-white",
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const targetPath =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  const validate = (): LoginErrors => {
    const next: LoginErrors = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const next = validate();
    setErrors(next);

    if (Object.keys(next).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Invalid email or password");
      }

      const data = await response.json();

      // ==========================================
      // CONSTRUCT SESSION OBJECT FOR DASHBOARD
      // ==========================================
      const sessionData = {
        user: {
          id: data.user_id || data.id || "1",
          name: data.name || "User",
          email: data.email || email,
          role: data.role || "donor",
        },
        token: data.access_token || "token",
      };

      // Save formatted session object expected by getCurrentSession()
      localStorage.setItem("user", JSON.stringify(sessionData));
      localStorage.setItem("lifelink_session", JSON.stringify(sessionData));

      // Dispatch event to refresh state listeners
      window.dispatchEvent(new Event("storage"));

      const firstName = sessionData.user.name.split(" ")[0];
      showToast(`Welcome back, ${firstName}!`);

      // Navigate to dashboard
      navigate(targetPath, { replace: true });
    } catch (error) {
      console.error(error);
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to log in with those credentials.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const applyPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword("password123");
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage donations, hospitals, and emergency requests."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          error={errors.email}
          onChange={(event) => setEmail(event.target.value)}
          icon={<Mail className="h-4 w-4" aria-hidden />}
        />
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={(event) => setPassword(event.target.value)}
          icon={<Lock className="h-4 w-4" aria-hidden />}
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border-line accent-primary"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-dark"
          >
            Forgot password?
          </Link>
        </div>

        <LoadingButton
          type="submit"
          fullWidth
          loading={submitting}
          loadingText="Logging in…"
        >
          Login
        </LoadingButton>

        <p className="text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            Create an account
          </Link>
        </p>

        <div className="relative py-2">
          <div aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-line" />
          <span className="relative mx-auto block w-fit bg-white px-3 text-xs font-medium uppercase tracking-wide text-muted">
            or continue as
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ROLE_PRESETS.map(({ role, email: presetEmail, icon: Icon, className }) => (
            <button
              key={role}
              type="button"
              onClick={() => applyPreset(presetEmail)}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${className}`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {role}
            </button>
          ))}
        </div>
      </form>
    </AuthLayout>
  );
}