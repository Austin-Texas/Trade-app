// Compatibility facade for code migrated from Base44.
// It makes NO Base44 network calls. Data will progressively move to Trade API.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://trade-api.hastenload.com";

const key = (entity) => `tradeapp:entity:${entity}`;
const read = (entity) => {
  try { return JSON.parse(localStorage.getItem(key(entity)) || "[]"); }
  catch { return []; }
};
const write = (entity, rows) => localStorage.setItem(key(entity), JSON.stringify(rows));

function entityApi(entity) {
  return {
    async list() { return read(entity); },
    async create(fields) {
      const rows = read(entity);
      const row = {
        id: globalThis.crypto?.randomUUID?.() || String(Date.now()),
        ...fields,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      rows.unshift(row); write(entity, rows); return row;
    },
    async update(id, fields) {
      const rows = read(entity);
      const i = rows.findIndex(r => String(r.id) === String(id));
      if (i < 0) throw new Error(`${entity} record not found`);
      rows[i] = {...rows[i], ...fields, updated_at: new Date().toISOString()};
      write(entity, rows); return rows[i];
    },
    async delete(id) {
      write(entity, read(entity).filter(r => String(r.id) !== String(id)));
      return {deleted:true};
    },
  };
}

export const tradeApi = {
  baseUrl: API_BASE,
  async request(path, options={}) {
    const url = `${API_BASE.replace(/\/$/, "")}${path.startsWith("/") ? path : "/" + path}`;
    const response = await fetch(url, {
      ...options,
      headers: {"Content-Type":"application/json", ...(options.headers||{})},
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.detail || data?.message || `HTTP ${response.status}`);
    return data;
  },
};

export const base44 = {
  app: {
    async getPublicSettings() {
      return {id:"standalone", public_settings:{backend_url:API_BASE, deployment:"self-hosted"}};
    },
  },
  auth: {
    async isAuthenticated(){ return false; },
    async me(){ throw new Error("Authentication is not configured on the Trade API yet."); },
    async loginViaEmailPassword(){ throw new Error("Trade API authentication is not configured yet."); },
    async register(){ throw new Error("Trade API registration is not configured yet."); },
    async verifyOtp(){ throw new Error("OTP verification is not configured yet."); },
    async resendOtp(){ throw new Error("OTP verification is not configured yet."); },
    async resetPasswordRequest(){ throw new Error("Password reset is not configured yet."); },
    async resetPassword(){ throw new Error("Password reset is not configured yet."); },
    async loginWithProvider(){ throw new Error("OAuth login is not configured yet."); },
    setToken(){},
    logout(returnTo){ localStorage.removeItem("trade_access_token"); if (returnTo) window.location.href=returnTo; },
    redirectToLogin(){ window.location.href="/"; },
  },
  entities: new Proxy({}, {get(_t,p){ return entityApi(String(p)); }}),
  functions: {
    async invoke(name) {
      if (name === "gmailConnectionStatus") return {data:{connected:false}};
      throw new Error(`${name} must be implemented on the Trade API.`);
    },
  },
  connectors: {
    async connectAppUser(){ throw new Error("External connectors are not configured on the Trade API."); },
    async disconnectAppUser(){ return {disconnected:true}; },
  },
};
