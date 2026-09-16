# Frontend security boundary

The browser bundle must not contain broker passwords, Cloudflare tokens, private keys, production API secrets, or deterministic execution/risk logic. The frontend may hold a short-lived user access token and call the self-hosted Trade API. Live execution stays disabled until server-side authentication, authorization, persistence, risk enforcement, and broker controls are verified.
