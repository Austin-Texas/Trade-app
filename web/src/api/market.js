import { tradeApi } from "./tradeApiClient";

export const marketApi = {
  status: () => tradeApi.request("/api/v1/market/status"),
  quote: (symbol) => tradeApi.request(`/api/v1/market/quote/${encodeURIComponent(symbol)}`),
  candles: (symbol, query = "") => tradeApi.request(`/api/v1/market/candles/${encodeURIComponent(symbol)}${query ? `?${query}` : ""}`),
};
