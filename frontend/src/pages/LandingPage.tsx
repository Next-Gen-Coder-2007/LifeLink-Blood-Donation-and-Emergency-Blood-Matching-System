import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Building2,
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

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.45, ease: "easeOut" as const },
};

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-soft via-background to-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-[32rem] w-[32rem] rounded-full bg-secondary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-28 lg:pt-24">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary-soft px-3.5 py-1.5 text-xs font-semibold text-secondary"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Smarter blood donation management
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-5 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Every Drop Can{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Save a Life.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-5 max-w-xl text-lg leading-relaxed text-muted"
          >
            LifeLink connects blood donors, hospitals, and patients through a
            smarter and faster blood donation management system.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button asChild size="lg">
              <Link to="/register/donor">
                Become a Donor
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/register/hospital">
                <Building2 className="h-4 w-4" aria-hidden />
                Register Your Hospital
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted"
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-secondary" aria-hidden />
              Donors across regions
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-secondary" aria-hidden />
              Verified hospitals
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mx-auto w-full max-w-lg"
        >
          <HeroIllustration />
        </motion.div>
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/10 to-secondary/10 blur-xl"
      />
      <div className="rounded-3xl border border-line bg-white p-6 shadow-card-hover">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Droplet className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Blood Available</p>
              <p className="text-xs text-muted">Updated live</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
            O+ in stock
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-background p-4">
            <p className="text-xs font-medium text-muted">Registered Donors</p>
            <p className="mt-1 text-2xl font-bold text-foreground">2,480</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-secondary" />
            </div>
          </div>
          <div className="rounded-2xl bg-background p-4">
            <p className="text-xs font-medium text-muted">Hospitals</p>
            <p className="mt-1 text-2xl font-bold text-foreground">86</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary to-secondary" />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Bell className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Emergency Request</p>
                <p className="text-xs text-muted">B- required near City Hospital</p>
              </div>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Zap className="h-4 w-4" aria-hidden />
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-soft text-secondary">
              <MapPin className="h-4 w-4" aria-hidden />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Rahul Mehta</span>
                <span className="text-muted">1.2 km away</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div className="h-full w-4/5 rounded-full bg-secondary" />
              </div>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <PhoneCall className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-3 -top-5 flex items-center gap-2 rounded-2xl border border-line bg-white px-3.5 py-2.5 shadow-card"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <HeartPulse className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-semibold text-foreground">Match Found</p>
          <p className="text-[10px] text-muted">Donor notified</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-5 -left-3 flex items-center gap-2 rounded-2xl border border-line bg-white px-3.5 py-2.5 shadow-card"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <LocateFixed className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-semibold text-foreground">Nearby Donors</p>
          <p className="text-[10px] text-muted">Within 5 km</p>
        </div>
      </motion.div>
    </div>
  );
}

function EmergencySection() {
  const features = [
    {
      icon: Zap,
      title: "Smart Matching",
      description: "Match patients with compatible blood donors instantly.",
    },
    {
      icon: LocateFixed,
      title: "Nearby Donors",
      description: "Identify available donors based on their location.",
    },
    {
      icon: Bell,
      title: "Emergency Alerts",
      description: "Help communicate urgent blood requirements quickly.",
    },
  ];

  return (
    <section id="for-donors" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600">
            <HeartPulse className="h-3.5 w-3.5" aria-hidden />
            Emergency Blood Management
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            When Every Second Matters
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            LifeLink helps hospitals identify available blood donors and
            coordinate emergency blood requirements faster.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group rounded-2xl border border-line bg-white p-7 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors group-hover:bg-red-500 group-hover:text-white">
                <feature.icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { number: "01", title: "Register", description: "Create your LifeLink account in under two minutes." },
    { number: "02", title: "Add Your Information", description: "Share your blood group, location, and availability." },
    { number: "03", title: "Find a Match", description: "Our matching engine connects you with those in need." },
    { number: "04", title: "Save a Life", description: "Donate when it matters most and make a difference." },
  ];

  return (
    <section id="how-it-works" className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary">
            How LifeLink Works
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Four Simple Steps
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            From registration to donation, LifeLink makes the entire process
            simple and transparent.
          </p>
        </motion.div>

        <div className="relative mt-14">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-line lg:block"
          />
          <ol className="grid gap-10 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, index) => (
              <motion.li
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative flex items-start gap-4 lg:flex-col lg:items-center lg:gap-5 lg:text-center"
              >
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white shadow-md">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
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

function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Verified Donor Network",
      description: "A trusted community of donors with up-to-date availability.",
    },
    {
      icon: ShieldCheck,
      title: "Secure & Private",
      description: "Your health data is protected and only shared when needed.",
    },
    {
      icon: Bell,
      title: "Instant Notifications",
      description: "Get alerted the moment your blood group is needed nearby.",
    },
    {
      icon: MapPin,
      title: "Location-Based Matching",
      description: "Find donors close to the hospital, reducing response time.",
    },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Key Features
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Everything a modern blood management system needs — built with
            reliability in mind.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="rounded-2xl border border-line bg-background p-6 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-card-hover"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary">
                <feature.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoleSection() {
  return (
    <section id="for-hospitals" className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary-soft px-3.5 py-1.5 text-xs font-semibold text-secondary">
            Who Are You?
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Join LifeLink Today
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Whether you donate or coordinate care, LifeLink has a place for you.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="flex flex-col rounded-2xl border border-line bg-white p-8 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Droplet className="h-6 w-6" aria-hidden />
            </span>
            <h3 className="mt-5 text-xl font-semibold text-foreground">
              Blood Donor
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
              Register as a donor and help people in emergency situations.
            </p>
            <Button asChild className="mt-6">
              <Link to="/register/donor">
                Register as Donor
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col rounded-2xl border border-line bg-white p-8 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Building2 className="h-6 w-6" aria-hidden />
            </span>
            <h3 className="mt-5 text-xl font-semibold text-foreground">Hospital</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
              Register your hospital and manage blood requirements efficiently.
            </p>
            <Button asChild variant="secondary" className="mt-6">
              <Link to="/register/hospital">
                Register Hospital
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-secondary px-6 py-16 text-center sm:px-16"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent/25 blur-3xl"
          />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Make a Difference?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-blue-100">
            Join thousands of donors and hospitals already connected through
            LifeLink. Every registration brings us one step closer to saving a
            life.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link to="/register/donor">
                Become a Donor
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white text-primary shadow-sm hover:bg-blue-50 focus-visible:outline-white"
            >
              <Link to="/register/hospital">
                <Building2 className="h-4 w-4" aria-hidden />
                Register Your Hospital
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <EmergencySection />
      <HowItWorksSection />
      <FeaturesSection />
      <RoleSection />
      <CtaSection />
    </>
  );
}
