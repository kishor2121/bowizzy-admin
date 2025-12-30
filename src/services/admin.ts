import api, { setAuthToken as setApiAuthToken } from "./api";

export async function getInterviewers() {
  const res = await api.get(`/admin/interviewers`);
  return res.data;
}

export async function getUsers() {
  const res = await api.get(`/admin/users`);
  return res.data;
}

export async function updateUser(id: number | string, data: Record<string, any>) {
  const res = await api.put(`/admin/users/${id}`, data);
  return res.data;
}

export async function getResumes() {
  const res = await api.get(`/admin/resumes`);
  return res.data;
}

// Helper to set the auth token for subsequent requests
export function setAuthToken(token?: string | null) {
  setApiAuthToken(token ?? null);
}

// Clear local auth state and (optionally) notify the backend
export async function logout() {
  try {
    // attempt server-side logout if supported; ignore errors
    await api.post(`/auth/logout`);
  } catch (e) {}
  setAuthToken(null);
  // eslint-disable-next-line no-console
  console.log("[auth] logged out");
}

export async function loginAdmin(credentials: { email: string; password: string }) {
  const res = await api.post(`/admin/login`, credentials);
  // if your backend returns a token in res.data.token, store it
  if (res.data && res.data.token) setAuthToken(res.data.token);
  return res.data;
}

export async function authLogin(credentials: { email: string; password: string }) {
  // include explicit type to satisfy API contract
  const payload = { ...credentials, type: "login" };
  // safe logging: avoid printing sensitive fields like password
  // eslint-disable-next-line no-console
  console.log("[authLogin] login attempt ->", { email: credentials.email, type: payload.type });
  const res = await api.post(`/auth`, payload);
  // store token if returned (common shape: { token: "..." })
  if (res.data && res.data.token) setAuthToken(res.data.token);
  return res.data;
}

export default { getInterviewers, getUsers, updateUser, getResumes, setAuthToken, loginAdmin, authLogin, logout };
