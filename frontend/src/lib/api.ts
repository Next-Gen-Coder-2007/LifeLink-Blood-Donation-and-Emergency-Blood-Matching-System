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
    profileId?: string;
    blood_group?: string;
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
          profileId: parsed.profile_id || parsed.profileId,
          blood_group: parsed.blood_group,
        },
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
  memoryCache.clear();
  window.dispatchEvent(new Event("storage"));
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const DEFAULT_CACHE_TTL = 15000; // 15 seconds client cache

export interface ApiRequestOptions extends RequestInit {
  cacheTTL?: number;
  forceRefresh?: boolean;
}

export async function request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const method = (options.method || "GET").toUpperCase();

  // Mutations invalidate the in-memory cache so subsequent fetches get fresh data
  if (method !== "GET") {
    memoryCache.clear();
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

  // Check in-memory cache for GET requests
  const cacheTTL = options.cacheTTL ?? DEFAULT_CACHE_TTL;
  const now = Date.now();
  if (!options.forceRefresh && memoryCache.has(endpoint)) {
    const entry = memoryCache.get(endpoint)!;
    if (now - entry.timestamp < cacheTTL) {
      return entry.data as T;
    }
  }

  // Deduplicate identical in-flight GET requests
  if (inFlightRequests.has(endpoint)) {
    return inFlightRequests.get(endpoint) as Promise<T>;
  }

  const fetchPromise = (async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };
      const response = await fetch(url, { ...options, headers });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || data.message || `Request failed with status ${response.status}`);
      }

      memoryCache.set(endpoint, { data, timestamp: Date.now() });
      return data as T;
    } finally {
      inFlightRequests.delete(endpoint);
    }
  })();

  inFlightRequests.set(endpoint, fetchPromise);
  return fetchPromise;
}

export const api = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) => request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
  invalidateCache: () => memoryCache.clear(),
};
