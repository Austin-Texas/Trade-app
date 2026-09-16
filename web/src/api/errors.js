export function apiErrorMessage(error, fallback = "Trade API request failed") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  return error.message || fallback;
}
