import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Droplet,
  Edit3,
  Loader2,
  Plus,
  Search,
  Siren,
  Trash2,
  X,
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

interface BloodRequest {
  id: string;
  hospital_id: string;
  blood_group: string;
  units_required: number;
  urgency: string;
  patient_name?: string | null;
  required_by?: string | null;
  status: string;
  created_at: string;
}

interface RequestForm {
  blood_group: string;
  units_required: string;
  urgency: string;
  patient_name: string;
  required_by: string;
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

const URGENCY_OPTIONS = [
  "normal",
  "urgent",
  "emergency",
];

const EMPTY_FORM: RequestForm = {
  blood_group: "A+",
  units_required: "1",
  urgency: "normal",
  patient_name: "",
  required_by: "",
};

export function HospitalBloodRequests() {
  const { showToast } = useToast();

  const [hospital, setHospital] =
    useState<Hospital | null>(null);

  const [requests, setRequests] = useState<
    BloodRequest[]
  >([]);

  const [form, setForm] =
    useState<RequestForm>(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] = useState("");

  /*
   * ==========================================================
   * GET LOGGED-IN HOSPITAL
   * ==========================================================
   */

  const loadHospital = async () => {
    const storedSession =
      localStorage.getItem("user") ||
      localStorage.getItem("lifelink_session");

    if (!storedSession) {
      throw new Error(
        "Hospital session not found."
      );
    }

    const session = JSON.parse(storedSession);
    const sessionUser =
      session.user || session;

    const userId = sessionUser.id;

    if (!userId) {
      throw new Error(
        "User ID not found in session."
      );
    }

    const response = await fetch(
      "http://127.0.0.1:8000/hospitals"
    );

    if (!response.ok) {
      throw new Error(
        "Unable to load hospital information."
      );
    }

    const hospitals: Hospital[] =
      await response.json();

    const currentHospital =
      hospitals.find(
        (item) =>
          String(item.user_id) ===
          String(userId)
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
   * GET HOSPITAL REQUESTS
   * ==========================================================
   */

  const loadRequests = async (
    hospitalId: string
  ) => {
    const response = await fetch(
      `http://127.0.0.1:8000/blood-requests/hospital/${hospitalId}`
    );

    if (!response.ok) {
      const data =
        await response
          .json()
          .catch(() => ({}));

      throw new Error(
        data.detail ||
          "Unable to load blood requests."
      );
    }

    const data: BloodRequest[] =
      await response.json();

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

        const currentHospital =
          await loadHospital();

        await loadRequests(
          currentHospital.id
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
   * FORM HANDLER
   * ==========================================================
   */

  const handleFormChange = (
    field: keyof RequestForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
   * ==========================================================
   * CREATE / UPDATE REQUEST
   * ==========================================================
   */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!hospital) {
      showToast(
        "Hospital information is unavailable.",
        "error"
      );
      return;
    }

    const units = Number(
      form.units_required
    );

    if (!units || units <= 0) {
      showToast(
        "Units required must be greater than 0.",
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);

      const isEditing =
        editingId !== null;

      const url = isEditing
        ? `http://127.0.0.1:8000/blood-requests/${editingId}`
        : "http://127.0.0.1:8000/blood-requests";

      const body = isEditing
        ? {
            blood_group:
              form.blood_group,
            units_required: units,
            urgency: form.urgency,
            patient_name:
              form.patient_name || null,
            required_by:
              form.required_by || null,
          }
        : {
            hospital_id: hospital.id,
            blood_group:
              form.blood_group,
            units_required: units,
            urgency: form.urgency,
            patient_name:
              form.patient_name || null,
            required_by:
              form.required_by || null,
          };

      const response = await fetch(
        url,
        {
          method: isEditing
            ? "PUT"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to save blood request."
        );
      }

      showToast(
        isEditing
          ? "Blood request updated successfully."
          : "Blood request created successfully."
      );

      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);

      await loadRequests(
        hospital.id
      );
    } catch (error) {
      console.error(error);

      showToast(
        error instanceof Error
          ? error.message
          : "Unable to save blood request.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ==========================================================
   * EDIT REQUEST
   * ==========================================================
   */

  const handleEdit = (
    request: BloodRequest
  ) => {
    setEditingId(request.id);

    setForm({
      blood_group:
        request.blood_group,
      units_required:
        String(request.units_required),
      urgency:
        request.urgency,
      patient_name:
        request.patient_name || "",
      required_by:
        request.required_by || "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ==========================================================
   * CANCEL REQUEST
   * ==========================================================
   */

  const handleDelete = async (
    requestId: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this blood request?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(requestId);

      const response = await fetch(
        `http://127.0.0.1:8000/blood-requests/${requestId}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to delete blood request."
        );
      }

      showToast(
        "Blood request cancelled successfully."
      );

      setRequests((previous) =>
        previous.filter(
          (request) =>
            request.id !== requestId
        )
      );
    } catch (error) {
      console.error(error);

      showToast(
        error instanceof Error
          ? error.message
          : "Unable to delete request.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * ==========================================================
   * CLOSE FORM
   * ==========================================================
   */

  const closeForm = () => {
    if (submitting) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  /*
   * ==========================================================
   * SEARCH
   * ==========================================================
   */

  const filteredRequests =
    requests.filter((request) => {
      const value =
        `${request.blood_group}
         ${request.urgency}
         ${request.patient_name || ""}
         ${request.status}`
          .toLowerCase();

      return value.includes(
        search.toLowerCase()
      );
    });

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
            Loading blood requests...
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
            to="/hospital/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
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
                {hospital?.hospital_name ||
                  "Hospital"}
              </p>

              <p className="text-xs text-muted">
                Blood Requests
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
            PAGE HEADER
        =================================================== */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

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
                Blood Requests
              </span>

            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Blood Requests
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted">
              Create and manage emergency blood
              requests from your hospital.
            </p>

          </div>

          <Button
            onClick={() => {
              setEditingId(null);
              setForm(EMPTY_FORM);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Request
          </Button>

        </div>

        {/* ===================================================
            CREATE / EDIT FORM
        =================================================== */}

        {showForm && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">

              <div>

                <h2 className="font-bold">
                  {editingId
                    ? "Edit Blood Request"
                    : "Create Blood Request"}
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Enter the blood requirement details.
                </p>

              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-slate-100 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Blood Group */}

                <div>

                  <label className="text-sm font-medium">
                    Blood Group
                  </label>

                  <select
                    value={form.blood_group}
                    onChange={(event) =>
                      handleFormChange(
                        "blood_group",
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >

                    {BLOOD_GROUPS.map(
                      (group) => (
                        <option
                          key={group}
                          value={group}
                        >
                          {group}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* Units */}

                <div>

                  <label className="text-sm font-medium">
                    Units Required
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.units_required}
                    onChange={(event) =>
                      handleFormChange(
                        "units_required",
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />

                </div>

                {/* Urgency */}

                <div>

                  <label className="text-sm font-medium">
                    Urgency
                  </label>

                  <select
                    value={form.urgency}
                    onChange={(event) =>
                      handleFormChange(
                        "urgency",
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >

                    {URGENCY_OPTIONS.map(
                      (urgency) => (
                        <option
                          key={urgency}
                          value={urgency}
                        >
                          {urgency
                            .charAt(0)
                            .toUpperCase() +
                            urgency.slice(1)}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* Required By */}

                <div>

                  <label className="text-sm font-medium">
                    Required By
                  </label>

                  <input
                    type="datetime-local"
                    value={form.required_by}
                    onChange={(event) =>
                      handleFormChange(
                        "required_by",
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />

                </div>

                {/* Patient */}

                <div className="sm:col-span-2">

                  <label className="text-sm font-medium">
                    Patient Name
                    <span className="ml-1 font-normal text-muted">
                      (Optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={form.patient_name}
                    onChange={(event) =>
                      handleFormChange(
                        "patient_name",
                        event.target.value
                      )
                    }
                    placeholder="Enter patient name"
                    className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />

                </div>

              </div>

              {/* Buttons */}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                >

                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingId
                        ? "Updating..."
                        : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      {editingId
                        ? "Update Request"
                        : "Create Request"}
                    </>
                  )}

                </Button>

              </div>

            </form>

          </section>
        )}

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="font-bold">
              Active Requests
            </h2>

            <p className="mt-1 text-xs text-muted">
              {requests.length} total request
              {requests.length !== 1
                ? "s"
                : ""}
            </p>

          </div>

          <div className="relative w-full sm:w-72">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="h-10 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />

          </div>

        </div>

        {/* ===================================================
            REQUEST LIST
        =================================================== */}

        <section className="mt-4 space-y-4">

          {filteredRequests.length === 0 ? (

            <div className="rounded-2xl border border-line bg-white p-10 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">

                <Droplet className="h-7 w-7" />

              </div>

              <h3 className="mt-5 text-lg font-bold">
                {search
                  ? "No requests found"
                  : "No blood requests yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                {search
                  ? "Try a different search term."
                  : "Create your first blood request to start finding compatible donors."}
              </p>

              {!search && (
                <Button
                  className="mt-5"
                  onClick={() => {
                    setForm(EMPTY_FORM);
                    setEditingId(null);
                    setShowForm(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create Request
                </Button>
              )}

            </div>

          ) : (

            filteredRequests.map(
              (request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  deleting={
                    deletingId ===
                    request.id
                  }
                />
              )
            )

          )}

        </section>

      </main>

    </div>
  );
}


/* ============================================================
   REQUEST CARD
============================================================ */

interface RequestCardProps {
  request: BloodRequest;
  onEdit: (
    request: BloodRequest
  ) => void;
  onDelete: (
    requestId: string
  ) => void;
  deleting: boolean;
}

function RequestCard({
  request,
  onEdit,
  onDelete,
  deleting,
}: RequestCardProps) {
  const isEmergency =
    request.urgency ===
    "emergency";

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
        isEmergency
          ? "border-red-200"
          : "border-line"
      }`}
    >

      <div className="p-5 sm:p-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          {/* Left */}

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

                <h3 className="text-xl font-bold">
                  {request.blood_group}
                </h3>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">
                  {request.units_required}{" "}
                  {request.units_required ===
                  1
                    ? "Unit"
                    : "Units"}
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isEmergency
                      ? "bg-red-50 text-red-600"
                      : request.urgency ===
                        "urgent"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {request.urgency
                    .charAt(0)
                    .toUpperCase() +
                    request.urgency.slice(1)}
                </span>

              </div>

              <p className="mt-1 text-sm text-muted">
                Blood donation request
              </p>

            </div>

          </div>

          {/* Status */}

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            {request.status
              .charAt(0)
              .toUpperCase() +
              request.status.slice(1)}

          </span>

        </div>

        {/* Details */}

        <div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">

          <Info
            label="Patient"
            value={
              request.patient_name ||
              "Not specified"
            }
          />

          <Info
            label="Required By"
            value={
              request.required_by ||
              "Not specified"
            }
          />

          <Info
            label="Created"
            value={formatDate(
              request.created_at
            )}
          />

        </div>

        {/* Actions */}

        <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onEdit(request)
            }
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={deleting}
            onClick={() =>
              onDelete(request.id)
            }
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >

            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Cancel
              </>
            )}

          </Button>

        </div>

      </div>

    </article>
  );
}


/* ============================================================
   INFO
============================================================ */

interface InfoProps {
  label: string;
  value: string;
}

function Info({
  label,
  value,
}: InfoProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">

      <p className="text-xs font-medium text-muted">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   DATE FORMAT
============================================================ */

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}