import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://bowizzy-backend-1.onrender.com";

const api = axios.create({ baseURL: API_BASE });

export function setAuthToken(token?: string | null) {
  if (token) {
    const headerVal = `Bearer ${token}`;
    api.defaults.headers.common["Authorization"] = headerVal;
    api.defaults.headers.common["authorization"] = headerVal;
    api.defaults.headers["Authorization"] = headerVal;

    console.log("[api] setAuthToken ->", headerVal.slice(0, 12) + "... (masked)");
    try {
      localStorage.setItem("authToken", token);
    } catch {}
  } else {
    delete api.defaults.headers.common["Authorization"];
    delete api.defaults.headers.common["authorization"];
    delete api.defaults.headers["Authorization"];
    try {
      localStorage.removeItem("authToken");
    } catch {}
  }
}

try {
  const token = localStorage.getItem("authToken");
  if (token) setAuthToken(token);
} catch {}

try {
  const hasToken = !!localStorage.getItem("authToken");
  if (!hasToken && typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setAuthToken(t);
  }
} catch {}

api.interceptors.request.use((cfg) => {
  try {
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
