# Standalone UI Migration

Branch: `base44-latest-ui-migration`

The frontend runtime is being migrated from the exported hosted-app SDK to the self-hosted Trade API. The branch contains the standalone API/auth/entity adapters and removes the hosted SDK packages from the frontend package manifest.

Production remains on `main` until build and API-contract verification are complete. Trading execution must remain disabled until server-side authentication, persistence, risk controls, and broker/MT5 authorization are verified.
