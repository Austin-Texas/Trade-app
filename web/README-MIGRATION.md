# Self-hosted frontend migration

This React/Vite frontend was migrated from the Global AI Trading Center Base44 app.

- Public frontend: https://trade-web.hastenload.com
- Backend API: https://trade-api.hastenload.com
- Base44 SDK/runtime/backend: not used
- Base44-specific entity calls currently use browser-local compatibility storage
- Authentication and Gmail connector features remain disabled until implemented by Trade API

The legacy filename `src/api/base44Client.js` is temporarily retained only to avoid
rewriting every UI component at once. It contains no Base44 SDK import or Base44 network call.
