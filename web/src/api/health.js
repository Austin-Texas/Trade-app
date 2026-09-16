import { tradeApi } from "./tradeApiClient";

export async function getTradeApiHealth() {
  return tradeApi.request("/health");
}
