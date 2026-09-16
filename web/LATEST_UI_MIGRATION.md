# Latest UI migration

Source of truth for this migration: `spirited-global-trade-pulse.zip` supplied by the project owner on 2026-09-15.

Migration rules:

- Preserve the newest UI/features from the supplied archive.
- Do not restore the hosted Base44 runtime, SDK, Vite plugin, app ID, auth, entities, functions, integrations, or billing backend.
- Browser backend traffic must use `VITE_API_BASE_URL` and the self-hosted Trade API.
- Keep broker credentials, deterministic risk controls, secrets, and execution logic on the FastAPI backend.
- Do not enable live order execution until backend authentication, persistence, risk controls, and broker/MT5 authorization are implemented and verified.

The standalone API adapter is `src/api/tradeApiClient.js`.
