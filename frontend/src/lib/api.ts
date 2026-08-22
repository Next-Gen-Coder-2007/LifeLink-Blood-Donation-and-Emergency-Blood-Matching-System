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

// ----------------------------------------------------------------------
// Stable Session Management (In-Memory Cache to prevent React reference churn)
// ----------------------------------------------------------------------
let cachedSessionRaw: string | null = null;
let cachedSessionObject: UserSession | null = null;

export const getSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem("user") || localStorage.getItem("lifelink_session");
    if (!raw || raw === "null" || raw === "undefined" || raw === "{}") {
      cachedSessionRaw = null;
      cachedSessionObject = null;
      return null;
    }

    if (raw === cachedSessionRaw && cachedSessionObject !== null) {
      return cachedSessionObject;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      cachedSessionRaw = null;
      cachedSessionObject = null;
      return null;
    }

    let session: UserSession | null = null;

    if (
      parsed.user &&
      typeof parsed.user === "object" &&
      (parsed.user.id || parsed.user.email || (parsed.user.name && parsed.user.name !== "User"))
    ) {
      session = {
        user: {
          id: String(parsed.user.id || parsed.user.user_id || ""),
          name: parsed.user.name || "User",
          email: parsed.user.email || "",
          role: (parsed.user.role || "donor") as "donor" | "hospital" | "admin",
          profileId: parsed.user.profileId || parsed.user.profile_id,
          blood_group: parsed.user.blood_group,
        },
        token: parsed.token || "session-active",
      };
    } else if (parsed.id || parsed.user_id || parsed.email) {
      session = {
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

    cachedSessionRaw = raw;
    cachedSessionObject = session;
    return session;
  } catch {
    cachedSessionRaw = null;
    cachedSessionObject = null;
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

  const serialized = JSON.stringify(session);
  cachedSessionRaw = serialized;
  cachedSessionObject = session;

  localStorage.setItem("user", serialized);
  localStorage.setItem("lifelink_session", serialized);
  window.dispatchEvent(new Event("storage"));
  return session;
};

export const clearSession = () => {
  cachedSessionRaw = null;
  cachedSessionObject = null;
  localStorage.removeItem("user");
  localStorage.removeItem("lifelink_session");
  api.invalidateCache();
  window.dispatchEvent(new Event("storage"));
};

// ----------------------------------------------------------------------
// Request Caching & Deduplication Store
// ----------------------------------------------------------------------
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const DEFAULT_CACHE_TTL_MS = 5000; // 5 seconds cache for GET requests
const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds timeout

export interface RequestConfig extends RequestInit {
  timeoutMs?: number;
  skipCache?: boolean;
  cacheTtlMs?: number;
}

export async function request<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const url = endpoint.startsWith("http")
    ? endpoint
    : API_BASE
    ? `${API_BASE}${endpoint}`
    : endpoint;

  // Mutating requests automatically invalidate relevant cache entries
  if (method !== "GET") {
    api.invalidateCache();
  }

  // Check cache for GET requests
  const cacheKey = `${method}:${url}`;
  if (method === "GET" && !options.skipCache) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }
  }

  // Deduplicate concurrent GET requests
  if (method === "GET") {
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight as Promise<T>;
    }
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // If consumer supplied a signal, link it
  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort());
  }

  const fetchPromise = (async () => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> || {}),
      };

      const session = getSession();
      if (session?.token && !headers["Authorization"]) {
        headers["Authorization"] = `Bearer ${session.token}`;
      }

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.message ||
          `Request failed with status ${response.status}`
        );
      }

      // Store in cache if GET
      if (method === "GET" && !options.skipCache) {
        const ttl = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
        responseCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + ttl,
        });
      }

      return data as T;
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error(`Request timed out after ${timeoutMs / 1000}s`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
      if (method === "GET") {
        inFlightRequests.delete(cacheKey);
      }
    }
  })();

  if (method === "GET") {
    inFlightRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestConfig) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestConfig) =>
    request<T>(endpoint, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestConfig) =>
    request<T>(endpoint, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string, options?: RequestConfig) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
  invalidateCache: (endpointPrefix?: string) => {
    if (!endpointPrefix) {
      responseCache.clear();
      return;
    }
    for (const key of responseCache.keys()) {
      if (key.includes(endpointPrefix)) {
        responseCache.delete(key);
      }
    }
  },
};
