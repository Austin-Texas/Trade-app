export const runtimeConfig = Object.freeze({
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || "https://trade-api.hastenload.com").replace(/\/$/, ""),
  selfHosted: true,
});
