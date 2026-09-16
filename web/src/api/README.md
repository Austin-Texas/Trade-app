# Frontend API boundary

`tradeApiClient.js` is the single browser-side client for the self-hosted FastAPI service. New UI code must use this client or focused wrappers built on top of it. Do not add hosted-platform SDK dependencies or put broker credentials/secrets in the browser bundle.

Current production base URL is configured with `VITE_API_BASE_URL`.
