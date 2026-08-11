import type {
  AuthSession,
  DonorRegistration,
  HospitalRegistration,
  LoginCredentials,
} from "@/types";

/**
 * Mock authentication layer.
 *
 * There is no backend yet. These functions simulate network latency and
 * persistence so the UI behaves like a production app. When the FastAPI
 * backend is ready, replace each function body with the corresponding
 * HTTP call:
 *
 *   login        -> POST /login
 *   registerDonor -> POST /users  + POST /donors
 *   registerHospital -> POST /users + POST /hospitals
 */

const MOCK_DELAY = 700;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_TOKEN =
  "mock-jwt-token.lifelink." + Math.random().toString(36).slice(2);

function persistSession(session: AuthSession) {
  localStorage.setItem("lifelink.session", JSON.stringify(session));
}

function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem("lifelink.session");
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function getCurrentSession(): AuthSession | null {
  return readSession();
}

export function clearSession() {
  localStorage.removeItem("lifelink.session");
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  await wait(MOCK_DELAY);

  if (!credentials.email || !credentials.password) {
    throw new Error("Invalid email or password.");
  }

  const role = credentials.email.toLowerCase().includes("hospital")
    ? "hospital"
    : "donor";

  const name = credentials.email.split("@")[0].replace(/[._-]+/g, " ");

  const session: AuthSession = {
    token: MOCK_TOKEN,
    user: {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: credentials.email,
      role,
    },
  };

  persistSession(session);
  return session;
}

export async function registerDonor(
  data: DonorRegistration,
): Promise<AuthSession> {
  await wait(MOCK_DELAY);

  const session: AuthSession = {
    token: MOCK_TOKEN,
    user: { name: data.name, email: data.email, role: "donor" },
  };

  persistSession(session);
  return session;
}

export async function registerHospital(
  data: HospitalRegistration,
): Promise<AuthSession> {
  await wait(MOCK_DELAY);

  const session: AuthSession = {
    token: MOCK_TOKEN,
    user: { name: data.name, email: data.email, role: "hospital" },
  };

  persistSession(session);
  return session;
}
