import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  Droplet,
  HeartPulse,
  LocateFixed,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { Button } from "@/components/Button";

// ============================================================
// SHARED ANIMATION
// ============================================================

const fadeUp = {
  initial: {
    opacity: 0,
    y: 24,
  },
  whileInView: {
    opacity: 1,
    y: 0,
  },
  viewport: {
    once: true,
    margin: "-80px",
  },
  transition: {
    duration: 0.5,
    ease: "easeOut" as const,
  },
};

// ============================================================
// HERO
// ============================================================

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-soft via-background to-white">

      {/* Background decoration */}

      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-secondary/10 blur-3xl"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-28 lg:pt-24">

        {/* ====================================================
            LEFT
        ==================================================== */}
<div className="flex flex-col items-center text-center">

  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45 }}
    className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-semibold text-primary shadow-sm"
  >
    <Sparkles className="h-3.5 w-3.5" />
    Smarter blood donation management
  </motion.div>

  <motion.h1
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.55,
      delay: 0.08,
    }}
    className="mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
  >
    Connecting Blood Donors
    <br />

    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
      When It Matters Most.
    </span>
  </motion.h1>

  <motion.p
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.55,
      delay: 0.16,
    }}
    className="mt-6 max-w-xl text-center text-base leading-7 text-muted sm:text-lg"
  >
    LifeLink connects donors, hospitals, and patients through
    a faster and smarter blood donation management system.
  </motion.p>

  {/* Buttons */}

  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.55,
      delay: 0.24,
    }}
    className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
  >
    <Button asChild size="lg">
      <Link to="/register/donor">
        Become a Donor
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>

    <Button
      asChild
      size="lg"
      variant="outline"
    >
      <Link to="/register/hospital">
        <Building2 className="h-4 w-4" />
        Register Hospital
      </Link>
    </Button>
  </motion.div>

  {/* Trust points */}

  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{
      duration: 0.6,
      delay: 0.4,
    }}
    className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted"
  >
    <span className="flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      Verified donor network
    </span>

    <span className="flex items-center gap-2">
      <ShieldCheck className="h-4 w-4 text-secondary" />
      Secure platform
    </span>

    <span className="flex items-center gap-2">
      <Activity className="h-4 w-4 text-primary" />
      Real-time matching
    </span>
  </motion.div>

</div>

        {/* ====================================================
            RIGHT — DASHBOARD PREVIEW
        ==================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.7,
            delay: 0.15,
          }}
          className="relative mx-auto w-full max-w-xl"
        >
          <HeroIllustration />
        </motion.div>

      </div>
    </section>
  );
}

// ============================================================
// HERO ILLUSTRATION
// ============================================================

function HeroIllustration() {
  return (
    <div className="relative">

      {/* Glow */}

      <div
        aria-hidden
        className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-primary/10 to-secondary/10 blur-2xl"
      />

      {/* Main card */}

      <div className="relative rounded-[2rem] border border-line bg-white p-5 shadow-card-hover sm:p-7">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Droplet className="h-6 w-6" />
            </span>

            <div>
              <p className="text-sm font-bold text-foreground">
                Blood Availability
              </p>

              <p className="text-xs text-muted">
                Live network status
              </p>
            </div>

          </div>

          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>

        </div>

        {/* Blood groups */}

        <div className="mt-6 grid grid-cols-4 gap-2">

          {[
            ["A+", "Available"],
            ["B+", "Available"],
            ["O+", "Available"],
            ["AB+", "Limited"],
          ].map(([group, status]) => (
            <div
              key={group}
              className="rounded-xl border border-line bg-background p-3 text-center"
            >
              <p className="text-lg font-bold text-foreground">
                {group}
              </p>

              <p
                className={`mt-1 text-[10px] font-semibold ${
                  status === "Limited"
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {status}
              </p>
            </div>
          ))}

        </div>

        {/* Statistics */}

        <div className="mt-5 grid grid-cols-2 gap-4">

          <div className="rounded-2xl bg-background p-4">

            <div className="flex items-center gap-2">

              <Users className="h-4 w-4 text-primary" />

              <p className="text-xs font-medium text-muted">
                Registered Donors
              </p>

            </div>

            <p className="mt-2 text-2xl font-bold text-foreground">
              2,480
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-secondary" />
            </div>

          </div>

          <div className="rounded-2xl bg-background p-4">

            <div className="flex items-center gap-2">

              <Building2 className="h-4 w-4 text-secondary" />

              <p className="text-xs font-medium text-muted">
                Hospitals
              </p>

            </div>

            <p className="mt-2 text-2xl font-bold text-foreground">
              86
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-secondary to-primary" />
            </div>

          </div>

        </div>

        {/* Emergency request */}

        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/50 p-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Bell className="h-5 w-5" />
              </span>

              <div>

                <p className="text-sm font-bold text-foreground">
                  Emergency Request
                </p>

                <p className="text-xs text-muted">
                  B- blood required
                </p>

              </div>

            </div>

            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase text-red-600">
              Urgent
            </span>

          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-red-100 pt-4">

            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-secondary">
              <MapPin className="h-4 w-4" />
            </span>

            <div className="flex-1">

              <div className="flex items-center justify-between">

                <span className="text-xs font-semibold text-foreground">
                  City Hospital
                </span>

                <span className="text-xs text-muted">
                  1.2 km
                </span>

              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                <div className="h-full w-4/5 rounded-full bg-secondary" />
              </div>

            </div>

            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary">
              <PhoneCall className="h-4 w-4" />
            </span>

          </div>

        </div>

      </div>

      {/* Floating card */}

      <motion.div
        animate={{
          y: [0, -7, 0],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-3 -top-5 hidden items-center gap-2 rounded-2xl border border-line bg-white px-3.5 py-2.5 shadow-card sm:flex"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <HeartPulse className="h-4 w-4" />
        </span>

        <div>
          <p className="text-xs font-bold text-foreground">
            Match Found
          </p>

          <p className="text-[10px] text-muted">
            Donor notified
          </p>
        </div>
      </motion.div>

      {/* Nearby donor */}

      <motion.div
        animate={{
          y: [0, 6, 0],
        }}
        transition={{
          duration: 3.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-2xl border border-line bg-white px-3.5 py-2.5 shadow-card sm:flex"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <LocateFixed className="h-4 w-4" />
        </span>

        <div>
          <p className="text-xs font-bold text-foreground">
            Nearby Donors
          </p>

          <p className="text-[10px] text-muted">
            Within 5 km
          </p>
        </div>
      </motion.div>

    </div>
  );
}

// ============================================================
// EMERGENCY SECTION
// ============================================================

function EmergencySection() {
  const features = [
    {
      icon: Zap,
      title: "Smart Matching",
      description:
        "Match patients with compatible blood donors quickly and accurately.",
    },
    {
      icon: LocateFixed,
      title: "Nearby Donors",
      description:
        "Find available donors based on location and blood-group compatibility.",
    },
    {
      icon: Bell,
      title: "Emergency Alerts",
      description:
        "Notify suitable donors when an urgent blood requirement is created.",
    },
  ];

  return (
    <section
      id="emergency"
      className="bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

        <motion.div
          {...fadeUp}
          className="mx-auto max-w-2xl text-center"
        >

          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600">
            <HeartPulse className="h-3.5 w-3.5" />
            Emergency Blood Management
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            When Every Second Matters
          </h2>

          <p className="mt-4 text-base leading-7 text-muted">
            LifeLink helps hospitals identify compatible donors,
            coordinate requirements, and respond to emergencies faster.
          </p>

        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  margin: "-60px",
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.1,
                }}
                className="group rounded-2xl border border-line bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >

                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors group-hover:bg-red-500 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>

                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted">
                  {feature.description}
                </p>

              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
}

// ============================================================
// HOW IT WORKS
// ============================================================

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Register",
      description:
        "Create your LifeLink account in just a few minutes.",
    },
    {
      number: "02",
      title: "Add Information",
      description:
        "Provide your blood group, location, contact information, and availability.",
    },
    {
      number: "03",
      title: "Find a Match",
      description:
        "LifeLink connects compatible donors and blood requirements.",
    },
    {
      number: "04",
      title: "Save a Life",
      description:
        "Respond to a request and make a meaningful difference.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

        <motion.div
          {...fadeUp}
          className="mx-auto max-w-2xl text-center"
        >

          <span className="inline-flex rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary">
            How LifeLink Works
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple. Fast. Connected.
          </h2>

          <p className="mt-4 text-base leading-7 text-muted">
            From registration to donation, LifeLink keeps the process
            simple and transparent.
          </p>

        </motion.div>

        <div className="relative mt-14">

          {/* Connecting line */}

          <div
            aria-hidden
            className="absolute left-[12%] right-[12%] top-7 hidden border-t-2 border-dashed border-line lg:block"
          />

          <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-6">

            {steps.map((step, index) => (
              <motion.li
                key={step.number}
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  margin: "-60px",
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.1,
                }}
                className="relative flex gap-4 lg:flex-col lg:items-center lg:text-center"
              >

                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white shadow-lg">
                  {step.number}
                </span>

                <div>

                  <h3 className="text-base font-bold text-foreground">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
                    {step.description}
                  </p>

                </div>

              </motion.li>
            ))}

          </ol>

        </div>

      </div>
    </section>
  );
}

// ============================================================
// FEATURES
// ============================================================

function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Verified Donor Network",
      description:
        "A trusted network of donors with up-to-date availability information.",
    },
    {
      icon: ShieldCheck,
      title: "Secure & Private",
      description:
        "Keep important user information protected throughout the platform.",
    },
    {
      icon: Bell,
      title: "Instant Notifications",
      description:
        "Notify relevant donors when their blood group is needed nearby.",
    },
    {
      icon: MapPin,
      title: "Location-Based Matching",
      description:
        "Find compatible donors near the hospital to reduce response time.",
    },
  ];

  return (
    <section
      id="features"
      className="bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

        <motion.div
          {...fadeUp}
          className="mx-auto max-w-2xl text-center"
        >

          <span className="inline-flex rounded-full bg-secondary-soft px-3.5 py-1.5 text-xs font-semibold text-secondary">
            Platform Features
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need
          </h2>

          <p className="mt-4 text-base leading-7 text-muted">
            A modern blood management platform designed to connect
            people and hospitals efficiently.
          </p>

        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  margin: "-60px",
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                }}
                className="group rounded-2xl border border-line bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-card-hover"
              >

                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>

                <h3 className="mt-5 text-base font-bold text-foreground">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted">
                  {feature.description}
                </p>

              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
}

// ============================================================
// DONOR / HOSPITAL
// ============================================================

function RoleSection() {
  return (
    <section className="bg-background">

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

        <motion.div
          {...fadeUp}
          className="mx-auto max-w-2xl text-center"
        >

          <span className="inline-flex rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary">
            Built For Everyone
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Choose Your Role
          </h2>

          <p className="mt-4 text-base leading-7 text-muted">
            Whether you want to donate blood or manage hospital
            requirements, LifeLink is built for you.
          </p>

        </motion.div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">

          {/* ==================================================
              DONOR
          ================================================== */}

          <motion.div
            id="for-donors"
            initial={{
              opacity: 0,
              x: -20,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              margin: "-60px",
            }}
            className="group relative overflow-hidden rounded-3xl border border-line bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover sm:p-10"
          >

            <div
              aria-hidden
              className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-50"
            />

            <div className="relative">

              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <Droplet className="h-7 w-7" />
              </span>

              <h3 className="mt-6 text-2xl font-bold text-foreground">
                Blood Donor
              </h3>

              <p className="mt-3 text-sm leading-6 text-muted">
                Register as a donor, manage your availability,
                discover nearby requests, and help someone when
                they need blood the most.
              </p>

              <div className="mt-6 space-y-3">

                {[
                  "Manage your donor profile",
                  "Receive nearby blood requests",
                  "Track your donation history",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </div>
                ))}

              </div>

              <Button
                asChild
                className="mt-8"
              >
                <Link to="/register/donor">
                  Register as Donor
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

            </div>

          </motion.div>

          {/* ==================================================
              HOSPITAL
          ================================================== */}

          <motion.div
            id="for-hospitals"
            initial={{
              opacity: 0,
              x: 20,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              margin: "-60px",
            }}
            transition={{
              delay: 0.1,
            }}
            className="group relative overflow-hidden rounded-3xl border border-line bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover sm:p-10"
          >

            <div
              aria-hidden
              className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-soft"
            />

            <div className="relative">

              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Building2 className="h-7 w-7" />
              </span>

              <h3 className="mt-6 text-2xl font-bold text-foreground">
                Hospital
              </h3>

              <p className="mt-3 text-sm leading-6 text-muted">
                Register your hospital, manage blood inventory,
                coordinate emergency requirements, and connect
                with suitable donors.
              </p>

              <div className="mt-6 space-y-3">

                {[
                  "Manage blood inventory",
                  "Create emergency requests",
                  "Find nearby compatible donors",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </div>
                ))}

              </div>

              <Button
                asChild
                variant="secondary"
                className="mt-8"
              >
                <Link to="/register/hospital">
                  Register Hospital
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}

// ============================================================
// CTA
// ============================================================

function CtaSection() {
  return (
    <section className="bg-white">

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary-dark to-secondary px-6 py-16 text-center shadow-xl sm:px-16"
        >

          {/* Background decoration */}

          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative">

            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white">
              <HeartPulse className="h-3.5 w-3.5" />
              Make a difference today
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Help Save a Life?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-blue-100">
              Join LifeLink and become part of a connected network
              helping donors and hospitals respond faster to blood
              requirements.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <Button
                asChild
                size="lg"
                variant="secondary"
              >
                <Link to="/register/donor">
                  Become a Donor
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

                          <Link
              to="/register/hospital"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-slate-100 hover:text-primary"
            >
              Register Hospital
              <ArrowRight className="h-4 w-4" />
            </Link>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}

// ============================================================
// LANDING PAGE
// ============================================================

export function LandingPage() {
  return (
    <div className="overflow-hidden">

      <HeroSection />

      <EmergencySection />

      <HowItWorksSection />

      <FeaturesSection />

      <RoleSection />

      <CtaSection />

    </div>
  );
}