import { tradeApi } from "./tradeApiClient";

export const tradingApi = {
  status: () => tradeApi.request("/api/v1/trading/status"),
};
