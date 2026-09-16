import { tradeApi } from "./tradeApiClient";

export const systemApi = {
  status: () => tradeApi.request("/api/v1/system/status"),
};
