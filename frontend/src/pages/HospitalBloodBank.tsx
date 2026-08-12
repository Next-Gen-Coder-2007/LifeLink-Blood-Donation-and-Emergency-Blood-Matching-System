import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  Droplet,
  Info,
  Loader2,
  Save,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";

interface Hospital {
  id: string;
  user_id: string;
  hospital_name: string;
  phone: string;
  emergency_contact: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface BloodInventory {
  id?: string;
  hospital_id: string;
  blood_group: string;
  units: number;
  updated_at?: string;
}

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

function getStatus(units: number) {
  if (units <= 2) {
    return {
      label: "Critical",
      className: "bg-red-50 text-red-600",
      dotClass: "bg-red-500",
    };
  }

  if (units <= 5) {
    return {
      label: "Low",
      className: "bg-amber-50 text-amber-600",
      dotClass: "bg-amber-500",
    };
  }

  return {
    label: "Healthy",
    className: "bg-emerald-50 text-emerald-600",
    dotClass: "bg-emerald-500",
  };
}

export function HospitalBloodBank() {
  const { showToast } = useToast();

  const [hospital, setHospital] = useState<Hospital | null>(
    null
  );

  const [inventory, setInventory] = useState<
    BloodInventory[]
  >([]);

  const [units, setUnits] = useState<Record<string, number>>(
    {}
  );

  const [loading, setLoading] = useState(true);
  const [savingGroup, setSavingGroup] = useState<string | null>(
    null
  );

  const [pageError, setPageError] = useState("");

  /*
   * ==========================================================
   * LOAD HOSPITAL
   * ==========================================================
   */

  const loadHospital = async () => {
    const storedSession =
      localStorage.getItem("user") ||
      localStorage.getItem("lifelink_session");

    if (!storedSession) {
      throw new Error("Hospital session not found.");
    }

    const session = JSON.parse(storedSession);

    const sessionUser = session.user || session;

    const userId = sessionUser.id;

    if (!userId) {
      throw new Error("User ID not found in session.");
    }

    const response = await fetch(
      "http://127.0.0.1:8000/hospitals"
    );

    if (!response.ok) {
      throw new Error(
        "Unable to load hospital information."
      );
    }

    const hospitals: Hospital[] = await response.json();

    const currentHospital = hospitals.find(
      (item) =>
        String(item.user_id) === String(userId)
    );

    if (!currentHospital) {
      throw new Error(
        "Hospital profile was not found."
      );
    }

    setHospital(currentHospital);

    return currentHospital;
  };

  /*
   * ==========================================================
   * LOAD BLOOD BANK
   * ==========================================================
   */

  const loadBloodBank = async (
    hospitalId: string
  ) => {
    const response = await fetch(
      `http://127.0.0.1:8000/hospitals/${hospitalId}/blood-bank`
    );

    if (!response.ok) {
      throw new Error(
        "Unable to load blood-bank inventory."
      );
    }

    const data: BloodInventory[] =
      await response.json();

    setInventory(data);

    /*
     * Convert API response into:
     *
     * {
     *   "A+": 10,
     *   "A-": 4,
     *   "B+": 8,
     *   ...
     * }
     */

    const nextUnits: Record<string, number> = {};

    BLOOD_GROUPS.forEach((group) => {
      const item = data.find(
        (entry) =>
          entry.blood_group === group
      );

      nextUnits[group] = item?.units ?? 0;
    });

    setUnits(nextUnits);
  };

  /*
   * ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setPageError("");

        const currentHospital =
          await loadHospital();

        await loadBloodBank(
          currentHospital.id
        );
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load blood bank.";

        setPageError(message);

        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  /*
   * ==========================================================
   * UPDATE UNITS IN LOCAL STATE
   * ==========================================================
   */

  const handleUnitsChange = (
    bloodGroup: string,
    value: string
  ) => {
    const parsedValue = Number(value);

    if (value === "") {
      setUnits((previous) => ({
        ...previous,
        [bloodGroup]: 0,
      }));

      return;
    }

    if (
      Number.isNaN(parsedValue) ||
      parsedValue < 0
    ) {
      return;
    }

    setUnits((previous) => ({
      ...previous,
      [bloodGroup]: parsedValue,
    }));
  };

  /*
   * ==========================================================
   * SAVE ONE BLOOD GROUP
   * ==========================================================
   */

  const handleSave = async (
    bloodGroup: string
  ) => {
    if (!hospital) {
      showToast(
        "Hospital information is unavailable.",
        "error"
      );

      return;
    }

    const currentUnits =
      units[bloodGroup] ?? 0;

    if (currentUnits < 0) {
      showToast(
        "Units cannot be negative.",
        "error"
      );

      return;
    }

    try {
      setSavingGroup(bloodGroup);

      const response = await fetch(
        `http://127.0.0.1:8000/hospitals/${hospital.id}/blood-bank`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blood_group: bloodGroup,
            units: currentUnits,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update blood inventory."
        );
      }

      showToast(
        `${bloodGroup} inventory updated successfully.`
      );

      /*
       * Reload from backend so UI always reflects
       * the actual MongoDB value.
       */

      await loadBloodBank(hospital.id);
    } catch (error) {
      console.error(error);

      showToast(
        error instanceof Error
          ? error.message
          : "Unable to update inventory.",
        "error"
      );
    } finally {
      setSavingGroup(null);
    }
  };

  /*
   * ==========================================================
   * STATISTICS
   * ==========================================================
   */

  const totalUnits = useMemo(() => {
    return BLOOD_GROUPS.reduce(
      (total, group) =>
        total + (units[group] ?? 0),
      0
    );
  }, [units]);

  const healthyGroups = useMemo(() => {
    return BLOOD_GROUPS.filter(
      (group) =>
        (units[group] ?? 0) > 5
    ).length;
  }, [units]);

  const lowGroups = useMemo(() => {
    return BLOOD_GROUPS.filter((group) => {
      const value = units[group] ?? 0;

      return value > 2 && value <= 5;
    }).length;
  }, [units]);

  const criticalGroups = useMemo(() => {
    return BLOOD_GROUPS.filter(
      (group) =>
        (units[group] ?? 0) <= 2
    ).length;
  }, [units]);

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />

          <p className="mt-3 text-sm text-muted">
            Loading blood bank...
          </p>

        </div>

      </div>
    );
  }

  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */

  if (pageError && !hospital) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <TriangleAlert className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-lg font-bold">
            Unable to load Blood Bank
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted">
            {pageError}
          </p>

          <Link
            to="/hospital/dashboard"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

        </div>

      </div>
    );
  }

  /*
   * ==========================================================
   * PAGE
   * ==========================================================
   */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-line bg-white">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <Link
            to="/hospital/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Building2 className="h-4 w-4" />
            </div>

            <div className="hidden text-right sm:block">

              <p className="text-sm font-semibold">
                {hospital?.hospital_name ||
                  "Hospital"}
              </p>

              <p className="text-xs text-muted">
                Blood Bank
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ===================================================
            PAGE TITLE
        =================================================== */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>

            <div className="flex items-center gap-2 text-sm text-muted">

              <Link
                to="/hospital/dashboard"
                className="hover:text-primary"
              >
                Dashboard
              </Link>

              <ChevronRight className="h-4 w-4" />

              <span className="text-foreground">
                Blood Bank
              </span>

            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
              Blood Bank
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Manage the available blood inventory for{" "}
              <span className="font-semibold text-foreground">
                {hospital?.hospital_name}
              </span>
              .
            </p>

          </div>

          <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3">

            <Droplet className="h-5 w-5 text-red-500" />

            <div>

              <p className="text-xs text-muted">
                Total Inventory
              </p>

              <p className="font-bold">
                {totalUnits}{" "}
                {totalUnits === 1
                  ? "unit"
                  : "units"}
              </p>

            </div>

          </div>

        </div>

        {/* ===================================================
            SUMMARY CARDS
        =================================================== */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            title="Total Units"
            value={totalUnits}
            description="All blood groups"
            icon={
              <PackageIcon />
            }
            iconClass="bg-primary-soft text-primary"
          />

          <SummaryCard
            title="Healthy"
            value={healthyGroups}
            description="Groups with > 5 units"
            icon={
              <CheckCircle2 className="h-5 w-5" />
            }
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            title="Low Stock"
            value={lowGroups}
            description="Groups needing attention"
            icon={
              <Info className="h-5 w-5" />
            }
            iconClass="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="Critical"
            value={criticalGroups}
            description="Groups at 2 units or less"
            icon={
              <TriangleAlert className="h-5 w-5" />
            }
            iconClass="bg-red-50 text-red-600"
          />

        </section>

        {/* ===================================================
            INVENTORY TABLE
        =================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div>

              <h2 className="font-bold text-foreground">
                Blood Inventory
              </h2>

              <p className="mt-1 text-xs text-muted">
                Update the number of available units for
                each blood group.
              </p>

            </div>

            <div className="flex items-center gap-2 text-xs text-muted">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Healthy

              <span className="ml-2 h-2 w-2 rounded-full bg-amber-500" />
              Low

              <span className="ml-2 h-2 w-2 rounded-full bg-red-500" />
              Critical

            </div>

          </div>

          {/* Desktop table */}

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full">

              <thead>

                <tr className="border-b border-line bg-slate-50 text-left">

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted">
                    Blood Group
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted">
                    Available Units
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {BLOOD_GROUPS.map((group) => {

                  const value =
                    units[group] ?? 0;

                  const status =
                    getStatus(value);

                  const isSaving =
                    savingGroup === group;

                  return (
                    <tr
                      key={group}
                      className="border-b border-line last:border-0"
                    >

                      {/* Blood group */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-600">
                            {group}
                          </div>

                          <div>

                            <p className="font-bold text-foreground">
                              {group}
                            </p>

                            <p className="text-xs text-muted">
                              Blood Group
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Units */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <input
                            type="number"
                            min="0"
                            value={value}
                            onChange={(event) =>
                              handleUnitsChange(
                                group,
                                event.target.value
                              )
                            }
                            className="h-10 w-28 rounded-lg border border-line bg-white px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                          />

                          <span className="text-sm text-muted">
                            units
                          </span>

                        </div>

                      </td>

                      {/* Status */}

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`}
                          />

                          {status.label}

                        </span>

                      </td>

                      {/* Save */}

                      <td className="px-6 py-5 text-right">

                        <Button
                          size="sm"
                          disabled={isSaving}
                          onClick={() =>
                            handleSave(group)
                          }
                        >

                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Save
                            </>
                          )}

                        </Button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

          {/* =================================================
              MOBILE CARDS
          ================================================= */}

          <div className="divide-y divide-line md:hidden">

            {BLOOD_GROUPS.map((group) => {

              const value =
                units[group] ?? 0;

              const status =
                getStatus(value);

              const isSaving =
                savingGroup === group;

              return (
                <div
                  key={group}
                  className="p-5"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-600">
                        {group}
                      </div>

                      <div>

                        <p className="font-bold">
                          {group}
                        </p>

                        <span
                          className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`}
                          />
                          {status.label}
                        </span>

                      </div>

                    </div>

                    <Droplet className="h-5 w-5 text-red-400" />

                  </div>

                  <div className="mt-5">

                    <label className="text-xs font-medium text-muted">
                      Available Units
                    </label>

                    <div className="mt-2 flex gap-3">

                      <input
                        type="number"
                        min="0"
                        value={value}
                        onChange={(event) =>
                          handleUnitsChange(
                            group,
                            event.target.value
                          )
                        }
                        className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />

                      <Button
                        disabled={isSaving}
                        onClick={() =>
                          handleSave(group)
                        }
                      >

                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save
                          </>
                        )}

                      </Button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* ===================================================
            INFORMATION
        =================================================== */}

        <section className="mt-6 rounded-2xl border border-primary/10 bg-primary-soft/40 p-5 sm:p-6">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
              <Info className="h-5 w-5" />
            </div>

            <div>

              <h3 className="font-semibold text-foreground">
                Blood Bank Status
              </h3>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
                Inventory is considered healthy when more than
                5 units are available, low between 3 and 5
                units, and critical at 2 units or below.
                Keep your inventory updated so LifeLink can
                provide accurate blood availability information.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


/* ============================================================
   SUMMARY CARD
============================================================ */

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-foreground">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted">
            {description}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ============================================================
   PACKAGE ICON
============================================================ */

function PackageIcon() {
  return <Droplet className="h-5 w-5" />;
}