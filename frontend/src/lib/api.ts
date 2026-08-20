export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

export interface UserSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: "donor" | "hospital" | "admin";
  };
  token?: string;
}

export const getSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem("user") || localStorage.getItem("lifelink_session");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.user) return parsed as UserSession;
    if (parsed.id || parsed.user_id) {
      return {
        user: {
          id: parsed.id || parsed.user_id,
          name: parsed.name || "User",
          email: parsed.email || "",
          role: parsed.role || "donor",
        },
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const setSession = (data: { user_id?: string; id?: string; name: string; email: string; role: string; token?: string }) => {
  const session: UserSession = {
    user: {
      id: String(data.user_id || data.id || "1"),
      name: data.name,
      email: data.email,
      role: (data.role || "donor") as "donor" | "hospital" | "admin",
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
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
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
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
