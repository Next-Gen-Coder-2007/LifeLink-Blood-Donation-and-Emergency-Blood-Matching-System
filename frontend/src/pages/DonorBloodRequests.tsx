import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Droplet,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Siren,
} from "lucide-react";

import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";

interface Donor {
  id: string;
  user_id: string;
  blood_group: string;
  phone: string;
  latitude: number;
  longitude: number;
  availability: boolean;
  last_donation_date?: string | null;
}

interface DonorBloodRequest {
  id: string;

  hospital_id: string;
  hospital_name: string;
  hospital_phone: string;
  emergency_contact: string;
  hospital_address: string;
  hospital_latitude: number;
  hospital_longitude: number;

  blood_group: string;
  units_required: number;
  urgency: string;
  patient_name?: string | null;
  required_by?: string | null;
  status: string;
  created_at: string;
}

function getUrgencyClass(urgency: string) {
  switch (urgency.toLowerCase()) {
    case "emergency":
      return "bg-red-50 text-red-600";

    case "urgent":
      return "bg-amber-50 text-amber-600";

    default:
      return "bg-blue-50 text-blue-600";
  }
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function DonorBloodRequests() {
  const { showToast } = useToast();

  const [donor, setDonor] =
    useState<Donor | null>(null);

  const [requests, setRequests] =
    useState<DonorBloodRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  /*
   * ==========================================================
   * GET LOGGED-IN DONOR
   * ==========================================================
   */

  const loadDonor = async () => {
    const storedSession =
      localStorage.getItem("user") ||
      localStorage.getItem("lifelink_session");

    if (!storedSession) {
      throw new Error(
        "Donor session not found."
      );
    }

    const session = JSON.parse(
      storedSession
    );

    const sessionUser =
      session.user || session;

    const userId = sessionUser.id;

    if (!userId) {
      throw new Error(
        "User ID not found in session."
      );
    }

    const response = await fetch(
      "http://127.0.0.1:8000/donors"
    );

    if (!response.ok) {
      throw new Error(
        "Unable to load donor information."
      );
    }

    const donors: Donor[] =
      await response.json();

    const currentDonor =
      donors.find(
        (item) =>
          String(item.user_id) ===
          String(userId)
      );

    if (!currentDonor) {
      throw new Error(
        "Donor profile not found."
      );
    }

    setDonor(currentDonor);

    return currentDonor;
  };

  /*
   * ==========================================================
   * GET MATCHING REQUESTS
   * ==========================================================
   */
const loadRequests = async (donorId: string) => {
  const url =
    `http://127.0.0.1:8000/blood-requests/donor/${donorId}`;

  console.log("DONOR ID:", donorId);
  console.log("REQUEST URL:", url);

  const response = await fetch(url);

  const data = await response.json();

  console.log("STATUS:", response.status);
  console.log("RESPONSE:", data);

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Unable to load blood requests."
    );
  }

  if (!Array.isArray(data)) {
    throw new Error(
      "Invalid response from blood request API."
    );
  }

  console.log(
    "MATCHING REQUESTS:",
    data.length
  );

  setRequests(data);
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

        const currentDonor =
          await loadDonor();

        await loadRequests(
          currentDonor.id
        );
      } catch (error) {
        console.error(error);

        showToast(
          error instanceof Error
            ? error.message
            : "Unable to load blood requests.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  /*
   * ==========================================================
   * REFRESH
   * ==========================================================
   */

  const handleRefresh = async () => {
    if (!donor) {
      return;
    }

    try {
      setRefreshing(true);

      await loadRequests(
        donor.id
      );

      showToast(
        "Blood requests refreshed."
      );
    } catch (error) {
      console.error(error);

      showToast(
        error instanceof Error
          ? error.message
          : "Unable to refresh requests.",
        "error"
      );
    } finally {
      setRefreshing(false);
    }
  };

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
            Finding matching blood requests...
          </p>

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

      <header className="sticky top-0 z-40 border-b border-line bg-white">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <Link
            to="/donor/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Droplet className="h-5 w-5" />
            </div>

            <div className="hidden text-right sm:block">

              <p className="text-sm font-semibold">
                Blood Requests
              </p>

              <p className="text-xs text-muted">
                Matching your blood group
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ===================================================
            TITLE
        =================================================== */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="flex items-center gap-2 text-sm text-muted">

              <Link
                to="/donor/dashboard"
                className="hover:text-primary"
              >
                Dashboard
              </Link>

              <ChevronRight className="h-4 w-4" />

              <span className="text-foreground">
                Blood Requests
              </span>

            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Blood Requests
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Active hospital blood requests
              matching your blood group.
            </p>

          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
          >

            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh

          </button>

        </div>

        {/* ===================================================
            BLOOD GROUP CARD
        =================================================== */}

        <section className="mt-6 rounded-2xl border border-primary/10 bg-primary-soft/40 p-5 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">

              <Droplet className="h-6 w-6" />

            </div>

            <div className="flex-1">

              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Your Blood Group
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">

                <h2 className="text-2xl font-bold">
                  {donor?.blood_group}
                </h2>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  Matching Requests Only
                </span>

              </div>

            </div>

            <div className="text-left sm:text-right">

              <p className="text-2xl font-bold">
                {requests.length}
              </p>

              <p className="text-xs text-muted">
                Active Requests
              </p>

            </div>

          </div>

        </section>

        {/* ===================================================
            REQUEST LIST
        =================================================== */}

        {requests.length === 0 ? (

          <section className="mt-6 rounded-2xl border border-line bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

              <Droplet className="h-7 w-7" />

            </div>

            <h2 className="mt-5 text-lg font-bold">
              No matching requests
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              There are currently no active hospital
              requests matching your{" "}
              <strong>
                {donor?.blood_group}
              </strong>{" "}
              blood group.
            </p>

          </section>

        ) : (

          <section className="mt-6 space-y-4">

            {requests.map(
              (request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                />
              )
            )}

          </section>

        )}

      </main>

    </div>
  );
}


/* ============================================================
   REQUEST CARD
============================================================ */

interface RequestCardProps {
  request: DonorBloodRequest;
}

function RequestCard({
  request,
}: RequestCardProps) {

  const isEmergency =
    request.urgency.toLowerCase() ===
    "emergency";

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
        isEmergency
          ? "border-red-200"
          : "border-line"
      }`}
    >

      {/* =====================================================
          REQUEST HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">

        <div className="flex gap-4">

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              isEmergency
                ? "bg-red-50 text-red-600"
                : "bg-primary-soft text-primary"
            }`}
          >

            {isEmergency ? (
              <Siren className="h-6 w-6" />
            ) : (
              <Droplet className="h-6 w-6" />
            )}

          </div>

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h2 className="text-xl font-bold">
                {request.blood_group}
              </h2>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">
                {request.units_required}{" "}
                {request.units_required === 1
                  ? "unit"
                  : "units"}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getUrgencyClass(
                  request.urgency
                )}`}
              >
                {request.urgency}
              </span>

            </div>

            <p className="mt-1 text-sm text-muted">
              Hospital blood request
            </p>

          </div>

        </div>

        {isEmergency && (
          <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">

            <Siren className="h-4 w-4" />

            Emergency

          </span>
        )}

      </div>

      {/* =====================================================
          BODY
      ===================================================== */}

      <div className="p-5 sm:p-6">

        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">

          {/* Hospital */}

          <div>

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">

                <Building2 className="h-5 w-5" />

              </div>

              <div>

                <p className="text-xs font-medium text-muted">
                  Requesting Hospital
                </p>

                <h3 className="mt-0.5 text-lg font-bold">
                  {request.hospital_name}
                </h3>

                <div className="mt-2 flex items-start gap-2 text-sm text-muted">

                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>
                    {request.hospital_address}
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* Details */}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">

            <InfoBox
              label="Required"
              value={`${request.units_required} ${
                request.units_required === 1
                  ? "unit"
                  : "units"
              }`}
            />

            <InfoBox
              label="Required By"
              value={formatDate(
                request.required_by
              )}
            />

            <InfoBox
              label="Status"
              value="Searching"
            />

          </div>

        </div>

        {/* Patient */}

        {request.patient_name && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4">

            <p className="text-xs font-medium text-muted">
              Patient
            </p>

            <p className="mt-1 text-sm font-semibold">
              {request.patient_name}
            </p>

          </div>
        )}

        {/* =================================================
            CONTACT
        ================================================= */}

        <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">

            <a
              href={`tel:${request.hospital_phone}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >

              <Phone className="h-4 w-4" />

              {request.hospital_phone}

            </a>

            <span className="text-sm text-muted">

              Emergency:{" "}

              <span className="font-semibold text-foreground">
                {request.emergency_contact}
              </span>

            </span>

          </div>

          <Button>
            Respond
          </Button>

        </div>

      </div>

    </article>
  );
}


/* ============================================================
   INFO BOX
============================================================ */

interface InfoBoxProps {
  label: string;
  value: string;
}

function InfoBox({
  label,
  value,
}: InfoBoxProps) {

  return (
    <div className="rounded-xl border border-line p-3">

      <p className="text-[11px] font-medium text-muted">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>

    </div>
  );
}