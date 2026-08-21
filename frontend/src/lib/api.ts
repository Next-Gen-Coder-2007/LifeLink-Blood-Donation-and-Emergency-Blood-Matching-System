export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:8000")
).replace(/\/$/, "");

export interface UserSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: "donor" | "hospital" | "admin";
    profileId?: string;
    blood_group?: string;
  };
  token?: string;
}

export const getSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem("user") || localStorage.getItem("lifelink_session");
    if (!raw || raw === "null" || raw === "undefined" || raw === "{}") return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    if (
      parsed.user &&
      typeof parsed.user === "object" &&
      (parsed.user.id || parsed.user.email || (parsed.user.name && parsed.user.name !== "User"))
    ) {
      return parsed as UserSession;
    }
    if (parsed.id || parsed.user_id || parsed.email) {
      return {
        user: {
          id: String(parsed.id || parsed.user_id || ""),
          name: parsed.name || "User",
          email: parsed.email || "",
          role: (parsed.role || "donor") as "donor" | "hospital" | "admin",
          profileId: parsed.profile_id || parsed.profileId,
          blood_group: parsed.blood_group,
        },
        token: parsed.token || "session-active",
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const setSession = (data: {
  user_id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  profile_id?: string | null;
  profileId?: string | null;
  blood_group?: string | null;
  token?: string;
}) => {
  const session: UserSession = {
    user: {
      id: String(data.user_id || data.id || "1"),
      name: data.name,
      email: data.email,
      role: (data.role || "donor") as "donor" | "hospital" | "admin",
      profileId: data.profile_id || data.profileId || undefined,
      blood_group: data.blood_group || undefined,
    },
    token: data.token || "session-active",
  };
  localStorage.setItem("user", JSON.stringify(session));
  localStorage.setItem("lifelink_session", JSON.stringify(session));
  window.dispatchEvent(new Event("storage"));
  return session;
};

export const clearSession = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("lifelink_session");
  window.dispatchEvent(new Event("storage"));
};

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : API_BASE
    ? `${API_BASE}${endpoint}`
    : endpoint;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
  invalidateCache: () => {},
};
