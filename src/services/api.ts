import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const api = axios.create({ baseURL: API_BASE });

// Manage token state and persist to localStorage for convenience.
export function setAuthToken(token?: string | null) {
  if (token) {
    const headerVal = `Bearer ${token}`;
    // set both capitalized and lower-case forms to be robust across environments
    api.defaults.headers.common["Authorization"] = headerVal;
    api.defaults.headers.common["authorization"] = headerVal;
    // also set at top-level defaults for some axios versions
    // @ts-ignore
    api.defaults.headers["Authorization"] = headerVal;
    // debug
    // eslint-disable-next-line no-console
    console.log("[api] setAuthToken ->", headerVal.slice(0, 12) + "... (masked)");
    try {
      localStorage.setItem("authToken", token);
    } catch {}
  } else {
    delete api.defaults.headers.common["Authorization"];
    delete api.defaults.headers.common["authorization"];
    // @ts-ignore
    delete api.defaults.headers["Authorization"];
    try {
      localStorage.removeItem("authToken");
    } catch {}
  }
}

// initialize from localStorage if present
try {
  const token = localStorage.getItem("authToken");
  if (token) setAuthToken(token);
} catch {}

// If there is no token in localStorage, allow a quick override via URL query `?token=...`
// This is handy during local development and testing (you can remove this in production)
try {
  const hasToken = !!localStorage.getItem("authToken");
  if (!hasToken && typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setAuthToken(t);
  }
} catch {}

// Debugging helpers: log outgoing Authorization header and 401 responses.
// Useful while developing locally to see whether the browser actually sends the header.
api.interceptors.request.use((cfg) => {
  try {
    // log several spots where the auth header might live
    // eslint-disable-next-line no-console
    console.log("[api] request", cfg.method, cfg.url, {
      headers: cfg.headers,
      authorization1: cfg.headers?.Authorization,
      authorization2: cfg.headers?.authorization,
      common: (cfg as any).headers?.common,
    });
  } catch (e) {}
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    try {
      if (err?.response?.status === 401) {
        // eslint-disable-next-line no-console
        console.warn("[api] 401 response", err.config?.url, err.response?.data || err.message);
      }
    } catch (e) {}
    return Promise.reject(err);
  }
);

export default api;
