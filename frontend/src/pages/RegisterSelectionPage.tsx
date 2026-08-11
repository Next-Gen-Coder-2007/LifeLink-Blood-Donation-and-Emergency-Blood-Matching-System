import { Link } from "react-router-dom";
import { Building2, Droplet, HeartPulse, ShieldCheck } from "lucide-react";
import { Button } from "@/components/Button";

const OPTIONS = [
  {
    to: "/register/donor",
    icon: Droplet,
    title: "I'm a Donor",
    description:
      "Create a donor profile to share your blood group, location, and availability so hospitals can reach you in emergencies.",
    iconClass: "bg-red-50 text-red-500",
    buttonVariant: "primary" as const,
  },
  {
    to: "/register/hospital",
    icon: Building2,
    title: "I'm a Hospital",
    description:
      "Register your hospital to post blood requirements and connect with compatible donors nearby, faster.",
    iconClass: "bg-primary-soft text-primary",
    buttonVariant: "secondary" as const,
  },
];

export function RegisterSelectionPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary">
            <HeartPulse className="h-3.5 w-3.5" aria-hidden />
            Get started
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Create Your LifeLink Account
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted">
            Choose the role that best describes you. Your profile will help us
            match blood donors and hospitals when it matters most.
          </p>
        </div>

        <div className="mt-10 grid w-full gap-6 md:grid-cols-2">
          {OPTIONS.map((option) => (
            <div
              key={option.title}
              className="flex flex-col rounded-2xl border border-line bg-white p-8 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${option.iconClass}`}
              >
                <option.icon className="h-7 w-7" aria-hidden />
              </span>
              <h2 className="mt-5 text-xl font-semibold text-foreground">
                {option.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {option.description}
              </p>
              <Button asChild variant={option.buttonVariant} className="mt-6">
                <Link to={option.to}>
                  Continue
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
