import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Droplet,
  Eye,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { useToast } from "@/context/ToastContext";

// =========================================================
// TYPES
// =========================================================

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Donor {
  id?: string;
  donor_id?: string;
  user_id?: string;
  blood_group?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  availability?: boolean;
  last_donation_date?: string;
}

interface Hospital {
  id?: string;
  hospital_id?: string;
  user_id?: string;
  hospital_name?: string;
  phone?: string;
  emergency_contact?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

// =========================================================
// API
// =========================================================

const API_BASE_URL = "http://127.0.0.1:8000";

// =========================================================
// COMPONENT
// =========================================================


interface AdminManagementPageProps {
  type: "donors" | "hospitals" | "users";
}

export function AdminManagementPage({
  type,
}: AdminManagementPageProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

const [selectedDonor, setSelectedDonor] =
useState<Donor | null>(null);

const [selectedUser, setSelectedUser] =
useState<User | null>(null);

const [selectedHospital, setSelectedHospital] =
useState<Hospital | null>(null);

  // =======================================================
  // ADMIN SESSION
  // =======================================================

  const getAdminSession = () => {
    try {
      const stored = localStorage.getItem("lifelink_admin");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const adminSession = getAdminSession();

  // =======================================================
  // PAGE TYPE
  // =======================================================

const pageType = type;
  // =======================================================
  // PAGE CONFIG
  // =======================================================

  const pageConfig = {
    donors: {
      title: "Manage Donors",
      description: "View and manage registered blood donors.",
      endpoint: "/donors",
      icon: Droplet,
    },

    hospitals: {
      title: "Manage Hospitals",
      description: "View and manage registered hospitals.",
      endpoint: "/hospitals",
      icon: Building2,
    },

    users: {
      title: "Manage Users",
      description: "View and manage LifeLink system accounts.",
      endpoint: "/users",
      icon: Users,
    },
  }[pageType];

  const PageIcon = pageConfig.icon;

  // =======================================================
  // FETCH DATA
  // =======================================================

  const fetchData = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}${pageConfig.endpoint}`
      );

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        `${pageType.toUpperCase()} RESPONSE:`,
        data
      );

      if (!Array.isArray(data)) {
        throw new Error(
          "API did not return an array"
        );
      }

      if (pageType === "users") {
        setUsers(data);
      }

      if (pageType === "donors") {
        setDonors(data);
      }

      if (pageType === "hospitals") {
        setHospitals(data);
      }

    } catch (error) {
      console.error(
        `Failed to load ${pageType}:`,
        error
      );

      showToast(
        `Unable to load ${pageType}.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    if (!adminSession) {
      navigate("/admin/login", {
        replace: true,
      });

      return;
    }

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageType]);

  // =======================================================
  // SEARCH
  // =======================================================

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [
        user.name,
        user.email,
        user.role,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [users, search]);

  const filteredDonors = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return donors;
    }

    return donors.filter((donor) =>
      [
        donor.donor_id,
        donor.user_id,
        donor.blood_group,
        donor.phone,
        donor.last_donation_date,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [donors, search]);

  const filteredHospitals = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return hospitals;
    }

    return hospitals.filter((hospital) =>
      [
        hospital.hospital_id,
        hospital.hospital_name,
        hospital.phone,
        hospital.emergency_contact,
        hospital.address,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [hospitals, search]);

  // =======================================================
  // DATE FORMAT
  // =======================================================

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  const handleDelete = async (
  type: "users" | "donors" | "hospitals",
  id: string
) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete this ${type.slice(0, -1)}? This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/${type}/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to delete record"
      );
    }

    showToast(
      data.message || "Deleted successfully.",
      "success"
    );

    // Close the currently opened modal
    setSelectedUser(null);
    setSelectedDonor(null);
    setSelectedHospital(null);

    // Reload data from MongoDB
    await fetchData();

  } catch (error) {
    console.error("Delete error:", error);

    showToast(
      error instanceof Error
        ? error.message
        : "Failed to delete record.",
      "error"
    );
  }
};

  // =======================================================
  // ADMIN CHECK
  // =======================================================

  if (!adminSession) {
    return null;
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="border-b border-line bg-white">

        <div className="flex h-16 items-center justify-between px-4 sm:px-6">

          <Logo to="/" />

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-semibold">
                {adminSession?.name ||
                  "Administrator"}
              </p>

              <p className="text-xs capitalize text-muted">
                {adminSession?.role || "admin"}
              </p>

            </div>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary font-bold text-white">

              {(adminSession?.name ||
                "Admin")
                .charAt(0)
                .toUpperCase()}

            </span>

          </div>

        </div>

      </header>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* BACK */}

        <button
          onClick={() =>
            navigate("/admin/dashboard")
          }
          className="mb-6 flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary"
        >

          <ArrowLeft className="h-4 w-4" />

          Back to Dashboard

        </button>

        {/* PAGE HEADER */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">

            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">

              <PageIcon className="h-6 w-6" />

            </span>

            <div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {pageConfig.title}
              </h1>

              <p className="mt-1 text-sm text-muted">
                {pageConfig.description}
              </p>

            </div>

          </div>

          <Button
            variant="outline"
            onClick={fetchData}
          >

            <RefreshCw className="h-4 w-4" />

            Refresh

          </Button>

        </div>

        {/* =================================================
            STAT
        ================================================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">

            <div className="flex items-center gap-3">

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">

                <PageIcon className="h-5 w-5" />

              </span>

              <div>

                <p className="text-xs font-medium text-muted">
                  Total {pageType === "users"
                    ? "Users"
                    : pageType === "donors"
                    ? "Donors"
                    : "Hospitals"}
                </p>

                <p className="text-2xl font-bold">
                  {loading
                    ? "..."
                    : pageType === "users"
                    ? users.length
                    : pageType === "donors"
                    ? donors.length
                    : hospitals.length}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">

            <div className="flex items-center gap-3">

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-soft text-secondary">

                <ShieldCheck className="h-5 w-5" />

              </span>

              <div>

                <p className="text-xs font-medium text-muted">
                  System Status
                </p>

                <p className="text-sm font-semibold text-emerald-600">
                  Connected
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-line bg-white p-4 shadow-card">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={`Search ${pageType}...`}
              className="w-full rounded-xl border border-line bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
            />

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">

          <div className="border-b border-line p-5">

            <h2 className="font-semibold">
              Registered{" "}
              {pageType === "users"
                ? "Users"
                : pageType === "donors"
                ? "Donors"
                : "Hospitals"}
            </h2>

            <p className="mt-1 text-xs text-muted">
              Data fetched directly from the LifeLink API.
            </p>

          </div>

          {loading ? (

            <div className="px-5 py-16 text-center">

              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-primary" />

              <p className="mt-3 text-sm text-muted">
                Loading data...
              </p>

            </div>

          ) : pageType === "users" ? (

            /* =================================================
               USERS TABLE
            ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[750px]">

                <thead>

                  <tr className="border-b border-line bg-background">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Name
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Email
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Registered
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredUsers.length === 0 ? (

                    <EmptyRow />

                  ) : (

                    filteredUsers.map((user) => (

                      <tr
                        key={user.id}
                        className="border-b border-line transition hover:bg-background"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-xs font-bold text-primary">

                              {user.name
                                ?.charAt(0)
                                .toUpperCase()}

                            </span>

                            <span className="text-sm font-semibold">
                              {user.name}
                            </span>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2 text-sm text-muted">

                            <Mail className="h-4 w-4" />

                            {user.email}

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium capitalize text-primary">
                            {user.role}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-sm text-muted">
                          {formatDate(user.created_at)}
                        </td>

                        <td className="px-5 py-4 text-right">

                                            <button
                                            type="button"
                                            onClick={() => setSelectedUser(user)}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                                            >
                                            <Eye className="h-4 w-4" />
                                            View
                                            </button>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          ) : pageType === "donors" ? (

            /* =================================================
               DONORS TABLE
            ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>

                  <tr className="border-b border-line bg-background">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Donor ID
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Blood Group
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Phone
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Location
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Availability
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Last Donation
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredDonors.length === 0 ? (

                    <EmptyRow />

                  ) : (

                    filteredDonors.map(
                      (donor, index) => (

                        <tr
                          key={
                            donor.id ||
                            donor.donor_id ||
                            index
                          }
                          className="border-b border-line transition hover:bg-background"
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500">

                                <Droplet className="h-4 w-4" />

                              </span>

                              <span className="text-sm font-semibold">

                                {donor.donor_id ||
                                  donor.id ||
                                  "—"}

                              </span>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">

                              {donor.blood_group ||
                                "—"}

                            </span>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2 text-sm text-muted">

                              <Phone className="h-4 w-4" />

                              {donor.phone ||
                                "—"}

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2 text-sm text-muted">

                              <MapPin className="h-4 w-4" />

                              {donor.latitude != null &&
                              donor.longitude != null
                                ? `${donor.latitude}, ${donor.longitude}`
                                : "—"}

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                donor.availability
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >

                              {donor.availability
                                ? "Available"
                                : "Unavailable"}

                            </span>

                          </td>

                          <td className="px-5 py-4 text-sm text-muted">

                            {formatDate(
                              donor.last_donation_date
                            )}

                          </td>

                          <td className="px-5 py-4 text-right">

                                                <button
                                                type="button"
                                                onClick={() => setSelectedDonor(donor)}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                                                >
                                                <Eye className="h-4 w-4" />
                                                View
                                                </button>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          ) : (

            /* =================================================
               HOSPITALS TABLE
            ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>

                  <tr className="border-b border-line bg-background">

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Hospital
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Phone
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Emergency Contact
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Address
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      Location
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredHospitals.length === 0 ? (

                    <EmptyRow />

                  ) : (

                    filteredHospitals.map(
                      (hospital, index) => (

                        <tr
                          key={
                            hospital.id ||
                            hospital.hospital_id ||
                            index
                          }
                          className="border-b border-line transition hover:bg-background"
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">

                                <Building2 className="h-4 w-4" />

                              </span>

                              <span className="text-sm font-semibold">

                                {hospital.hospital_name ||
                                  hospital.id ||
                                  "—"}

                              </span>

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2 text-sm text-muted">

                              <Phone className="h-4 w-4" />

                              {hospital.phone ||
                                "—"}

                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2 text-sm text-muted">

                              <Phone className="h-4 w-4" />

                              {hospital.emergency_contact ||
                                "—"}

                            </div>

                          </td>

                          <td className="max-w-xs px-5 py-4">

                            <p className="truncate text-sm text-muted">

                              {hospital.address ||
                                "—"}

                            </p>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2 text-sm text-muted">

                              <MapPin className="h-4 w-4" />

                              {hospital.latitude != null &&
                              hospital.longitude != null
                                ? `${hospital.latitude}, ${hospital.longitude}`
                                : "—"}

                            </div>

                          </td>

                          <td className="px-5 py-4 text-right">

                                                <button
                                                type="button"
                                                onClick={() => setSelectedHospital(hospital)}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                                                >
                                                <Eye className="h-4 w-4" />
                                                View
                                                </button>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>
                    {/* =====================================================
                    DONOR DETAILS MODAL
                ===================================================== */}

                {selectedDonor && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onClick={() => setSelectedDonor(null)}
                >

                    <div
                    className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
                    onClick={(event) => event.stopPropagation()}
                    >

                    {/* =================================================
                        MODAL HEADER
                    ================================================= */}

                    <div className="flex items-center justify-between border-b border-line px-6 py-5">

                        <div>

                        <h2 className="text-lg font-bold text-foreground">
                            Donor Details
                        </h2>

                        <p className="mt-1 text-xs text-muted">
                            Registered donor information
                        </p>

                        </div>

                        <button
                        type="button"
                        onClick={() => setSelectedDonor(null)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:bg-background hover:text-foreground"
                        aria-label="Close donor details"
                        >
                        X
                        </button>

                    </div>

                    {/* =================================================
                        MODAL CONTENT
                    ================================================= */}

                    <div className="space-y-5 px-6 py-6">

                        {/* Donor ID */}

                        <div>

                        <p className="text-xs font-medium text-muted">
                            Donor ID
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-foreground">
                            {selectedDonor.donor_id ||
                            selectedDonor.id ||
                            "—"}
                        </p>

                        </div>

                        {/* Blood Group */}

                        <div className="flex items-center justify-between border-b border-line pb-4">

                        <p className="text-sm text-muted">
                            Blood Group
                        </p>

                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                            {selectedDonor.blood_group || "—"}
                        </span>

                        </div>

                        {/* Phone */}

                        <div className="flex items-center justify-between border-b border-line pb-4">

                        <p className="text-sm text-muted">
                            Phone
                        </p>

                        <p className="text-sm font-semibold text-foreground">
                            {selectedDonor.phone || "—"}
                        </p>

                        </div>

                        {/* Availability */}

                        <div className="flex items-center justify-between border-b border-line pb-4">

                        <p className="text-sm text-muted">
                            Availability
                        </p>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            selectedDonor.availability
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {selectedDonor.availability
                            ? "Available"
                            : "Unavailable"}
                        </span>

                        </div>

                        {/* Location */}

                        <div className="flex items-center justify-between border-b border-line pb-4">

                        <p className="text-sm text-muted">
                            Location
                        </p>

                        <p className="text-sm font-semibold text-foreground">

                            {selectedDonor.latitude != null &&
                            selectedDonor.longitude != null
                            ? `${selectedDonor.latitude}, ${selectedDonor.longitude}`
                            : "—"}

                        </p>

                        </div>

                        {/* Last Donation */}

                        <div className="flex items-center justify-between">

                        <p className="text-sm text-muted">
                            Last Donation
                        </p>

                        <p className="text-sm font-semibold text-foreground">
                            {formatDate(
                            selectedDonor.last_donation_date
                            )}
                        </p>

                        </div>

                    </div>

                    {/* =================================================
                        MODAL FOOTER
                    ================================================= */}
                            <div className="flex items-center justify-between border-t border-line bg-background px-6 py-4">

                            <Button
                                variant="outline"
                                onClick={() => {
                                const id =
                                    selectedDonor.id ||
                                    selectedDonor.donor_id;

                                if (id) {
                                    handleDelete("donors", id);
                                }
                                }}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Donor
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setSelectedDonor(null)}
                            >
                                Close
                            </Button>

                        </div>

                    </div>

                </div>
                )}




                {/* =====================================================
                    USER DETAILS MODAL
                ===================================================== */}

                {selectedUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                    className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
                    onClick={(event) => event.stopPropagation()}
                    >

                    {/* HEADER */}

                    <div className="flex items-center justify-between border-b border-line px-6 py-5">

                        <div>
                        <h2 className="text-lg font-bold">
                            User Details
                        </h2>

                        <p className="mt-1 text-xs text-muted">
                            Registered account information
                        </p>
                        </div>

                        <button
                        type="button"
                        onClick={() => setSelectedUser(null)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-background"
                        >
                        X
                        </button>

                    </div>

                    {/* CONTENT */}

                    <div className="space-y-5 px-6 py-6">

                        <div>
                        <p className="text-xs font-medium text-muted">
                            User ID
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold">
                            {selectedUser.id || "—"}
                        </p>
                        </div>

                        <div className="flex items-center justify-between border-b border-line pb-4">

                        <p className="text-sm text-muted">
                            Name
                        </p>

                        <p className="text-sm font-semibold">
                            {selectedUser.name || "—"}
                        </p>

                        </div>

                        <div className="flex items-center justify-between border-b border-line pb-4">

                        <p className="text-sm text-muted">
                            Email
                        </p>

                        <p className="break-all text-sm font-semibold">
                            {selectedUser.email || "—"}
                        </p>

                        </div>

                        <div className="flex items-center justify-between border-b border-line pb-4">

                        <p className="text-sm text-muted">
                            Role
                        </p>

                        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold capitalize text-primary">
                            {selectedUser.role || "—"}
                        </span>

                        </div>

                        <div className="flex items-center justify-between">

                        <p className="text-sm text-muted">
                            Registered
                        </p>

                        <p className="text-sm font-semibold">
                            {formatDate(selectedUser.created_at)}
                        </p>

                        </div>

                    </div>

                    {/* FOOTER */}

                        <div className="flex items-center justify-between border-t border-line bg-background px-6 py-4">

                        <Button
                            variant="outline"
                            onClick={() => {
                            if (selectedUser.id) {
                                handleDelete("users", selectedUser.id);
                            }
                            }}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete User
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setSelectedUser(null)}
                        >
                            Close
                        </Button>

                        </div>

                    </div>
                </div>
                )}


                {/* =====================================================
                    HOSPITAL DETAILS MODAL
                ===================================================== */}

                {selectedHospital && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onClick={() => setSelectedHospital(null)}
                >
                    <div
                    className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
                    onClick={(event) => event.stopPropagation()}
                    >

                    {/* HEADER */}

                    <div className="flex items-center justify-between border-b border-line px-6 py-5">

                        <div>

                        <h2 className="text-lg font-bold">
                            Hospital Details
                        </h2>

                        <p className="mt-1 text-xs text-muted">
                            Registered hospital information
                        </p>

                        </div>

                        <button
                        type="button"
                        onClick={() => setSelectedHospital(null)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-background"
                        >
                        X
                        </button>

                    </div>

                    {/* CONTENT */}

                    <div className="space-y-5 px-6 py-6">

                        <div>

                        <p className="text-xs font-medium text-muted">
                            Hospital ID
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold">
                            {selectedHospital.hospital_id ||
                            selectedHospital.id ||
                            "—"}
                        </p>

                        </div>

                        <div className="flex items-center justify-between border-b border-line pb-4">

                        <p className="text-sm text-muted">
                            Hospital Name
                        </p>

                        <p className="text-right text-sm font-semibold">
                            {selectedHospital.hospital_name ||
                            "—"}
                        </p>

                        </div>

                        <div className="flex items-center justify-between border-b border-line pb-4">

                        <p className="text-sm text-muted">
                            Phone
                        </p>

                        <p className="text-sm font-semibold">
                            {selectedHospital.phone || "—"}
                        </p>

                        </div>

                        <div className="flex items-center justify-between border-b border-line pb-4">

                        <p className="text-sm text-muted">
                            Emergency Contact
                        </p>

                        <p className="text-sm font-semibold">
                            {selectedHospital.emergency_contact ||
                            "—"}
                        </p>

                        </div>

                        <div className="border-b border-line pb-4">

                        <p className="text-sm text-muted">
                            Address
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                            {selectedHospital.address || "—"}
                        </p>

                        </div>

                        <div className="flex items-center justify-between">

                        <p className="text-sm text-muted">
                            Location
                        </p>

                        <p className="text-sm font-semibold">

                            {selectedHospital.latitude != null &&
                            selectedHospital.longitude != null
                            ? `${selectedHospital.latitude}, ${selectedHospital.longitude}`
                            : "—"}

                        </p>

                        </div>

                    </div>

                    {/* FOOTER */}

                            <div className="flex items-center justify-between border-t border-line bg-background px-6 py-4">

                            <Button
                                variant="outline"
                                onClick={() => {
                                const id =
                                    selectedHospital.id ||
                                    selectedHospital.hospital_id;

                                if (id) {
                                    handleDelete("hospitals", id);
                                }
                                }}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Hospital
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setSelectedHospital(null)}
                            >
                                Close
                            </Button>

                            </div>

                    </div>
                </div>
                )}

    </div>
  );
}


// =========================================================
// EMPTY TABLE
// =========================================================

function EmptyRow() {
  return (
    <tr>
      <td
        colSpan={10}
        className="px-5 py-16 text-center"
      >
        <UserRound className="mx-auto h-8 w-8 text-muted" />

        <p className="mt-3 text-sm font-medium">
          No records found
        </p>

        <p className="mt-1 text-xs text-muted">
          There are no matching records.
        </p>
      </td>
    </tr>
  );
}