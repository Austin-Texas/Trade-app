const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://trade-api.hastenload.com").replace(/\/$/, "");
const TOKEN_KEY = "tradeapp:access_token";

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(token) { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); }

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && options.body != null) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, credentials: "include" });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `Trade API request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  const type = response.headers.get("content-type") || "";
  return type.includes("application/json") ? response.json() : response.text();
}

const entityPath = (name) => `/api/v1/entities/${encodeURIComponent(name)}`;
const entity = (name) => ({
  list: (sort = "", limit = 100) => request(`${entityPath(name)}?sort=${encodeURIComponent(sort)}&limit=${limit}`),
  filter: (criteria = {}) => request(`${entityPath(name)}/filter`, { method: "POST", body: JSON.stringify(criteria) }),
  create: (data) => request(entityPath(name), { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`${entityPath(name)}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id) => request(`${entityPath(name)}/${encodeURIComponent(id)}`, { method: "DELETE" }),
});

export const tradeApi = {
  baseUrl: API_BASE_URL,
  request,
  auth: {
    setToken,
    isAuthenticated: async () => {
      if (!getToken()) return false;
      try { await request("/api/v1/auth/me"); return true; } catch { return false; }
    },
    me: () => request("/api/v1/auth/me"),
    loginViaEmailPassword: async (email, password) => {
      const result = await request("/api/v1/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      if (result?.access_token) setToken(result.access_token);
      return result;
    },
    register: (data) => request("/api/v1/auth/register", { method: "POST", body: JSON.stringify(data) }),
    verifyOtp: (data) => request("/api/v1/auth/verify-otp", { method: "POST", body: JSON.stringify(data) }),
    resendOtp: (email) => request("/api/v1/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }),
    resetPasswordRequest: (email) => request("/api/v1/auth/password/reset-request", { method: "POST", body: JSON.stringify({ email }) }),
    resetPassword: (data) => request("/api/v1/auth/password/reset", { method: "POST", body: JSON.stringify(data) }),
    changePassword: (data) => request("/api/v1/auth/password/change", { method: "POST", body: JSON.stringify(data) }),
    updateMe: (data) => request("/api/v1/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
    loginWithProvider: (provider, returnTo = "/") => window.location.assign(`${API_BASE_URL}/api/v1/auth/oauth/${encodeURIComponent(provider)}?return_to=${encodeURIComponent(returnTo)}`),
    logout: async (returnTo = "/login") => { try { await request("/api/v1/auth/logout", { method: "POST" }); } catch {} setToken(null); window.location.assign(returnTo); },
  },
  entities: new Proxy({}, { get: (_, name) => entity(String(name)) }),
  functions: { invoke: (name, data = {}) => request(`/api/v1/functions/${encodeURIComponent(name)}`, { method: "POST", body: JSON.stringify(data) }) },
  users: { inviteUser: (email, role) => request("/api/v1/users/invite", { method: "POST", body: JSON.stringify({ email, role }) }) },
  integrations: { Core: { UploadFile: async ({ file }) => { const form = new FormData(); form.append("file", file); return request("/api/v1/files/upload", { method: "POST", body: form }); } } },
};
