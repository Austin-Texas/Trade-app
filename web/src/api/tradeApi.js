const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://trade-api.hastenload.com";

async function request(path, options = {}) {
  const url = `${API_BASE.replace(/\/$/, "")}${path.startsWith("/") ? path : "/" + path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.detail || data?.message || `HTTP ${response.status}`);
  }
  return data;
}

export const tradeApi = {
  baseUrl: API_BASE,
  request,
  systemStatus: () => request("/api/v1/system/status"),
  marketStatus: () => request("/api/v1/market/status"),
  quotes: (symbols) =>
    request(`/api/v1/market/quotes?symbols=${encodeURIComponent(symbols.join(","))}`),
  quote: (symbol) =>
    request(`/api/v1/market/quote/${encodeURIComponent(symbol)}`),
  candles: (symbol, timeframe = "1h", limit = 100) =>
    request(
      `/api/v1/market/candles/${encodeURIComponent(symbol)}?timeframe=${encodeURIComponent(timeframe)}&limit=${limit}`
    ),
};

export default tradeApi;
