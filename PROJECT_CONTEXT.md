# Global AI Trading Center — Project Context

> **Purpose of this file**
>
> This is the persistent project handoff / memory file for the Global AI Trading Center.
> In any new ChatGPT conversation, fetch and read this file **before making changes**.
> Update this file whenever architecture, deployment, domains, ports, major features,
> branch status, or operating procedures change.
>
> **Repository:** `Austin-Texas/Trade-app`  
> **Primary branch:** `main`  
> **Project path on VM:** `/home/trad/Trade-app`  
> **Last reviewed:** 2026-09-14  
> **Context revision:** 2026-09-14-r1

---

## 1. Project Mission

The project is a self-hosted **Global AI Trading Center**.

The application is intended to combine:

- global market monitoring
- stocks, ETFs, indices, crypto, forex, commodities, and futures
- technical charting and indicators
- AI-generated trade analysis and signals
- opportunities scanning
- news, macro, and geopolitical risk intelligence
- backtesting
- risk controls
- broker / MT5 connectivity
- trading-bot management
- account and plan management

The current architecture deliberately separates the frontend from deterministic
backend trading logic. Calculations, market-data integrations, risk controls,
broker connections, secrets, backtesting, and future execution logic belong on
the backend / VM rather than in browser code.

**Important safety state:** live order execution is currently locked / disabled.

---

## 2. Source-of-Truth Architecture

```text
Internet
   |
   +--> https://trade-web.hastenload.com
   |        |
   |        +--> Cloudflare Tunnel: cloudflared-web
   |                 |
   |                 +--> 10.0.0.56:8080
   |                          |
   |                          +--> Docker: trade-web
   |                                   |
   |                                   +--> React/Vite frontend served by Nginx
   |
   +--> https://trade-api.hastenload.com
            |
            +--> Cloudflare Tunnel: cloudflared-api
                     |
                     +--> 10.0.0.56:8100
                              |
                              +--> Docker: trade-api
                                       |
                                       +--> FastAPI on container port 8000
```

### VM / Docker

Host reference:

```text
trad-vm
```

Known host IP used by Cloudflare routes:

```text
10.0.0.56
```

Current application containers:

| Container | Host Port | Container Port | Purpose |
|---|---:|---:|---|
| `trade-web` | 8080 | 80 | React/Vite production frontend via Nginx |
| `trade-api` | 8100 | 8000 | FastAPI backend |
| `cloudflared-web` | — | — | Web Cloudflare Tunnel connector |
| `cloudflared-api` | — | — | API Cloudflare Tunnel connector |

The Cloudflare tunnel containers are currently managed separately from
`compose.yaml`.

**Never store Cloudflare tunnel tokens in this repository or in this file.**

---

## 3. Public URLs

Frontend:

```text
https://trade-web.hastenload.com
```

Backend API:

```text
https://trade-api.hastenload.com
```

FastAPI Swagger:

```text
https://trade-api.hastenload.com/docs
```

Health check:

```text
https://trade-api.hastenload.com/health
```

Expected health result:

```json
{"status":"healthy"}
```

---

## 4. Current Repository Layout

Important paths:

```text
Trade-app/
├── api/
│   ├── main.py
│   ├── routers/
│   │   ├── accounts.py
│   │   ├── backtest.py
│   │   ├── market.py
│   │   ├── risk.py
│   │   ├── signals.py
│   │   ├── strategies.py
│   │   ├── system.py
│   │   └── trading.py
│   └── services/
│       └── market/
│           ├── base.py
│           ├── factory.py
│           └── mock.py
├── web/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/
│   │   ├── components/
│   │   ├── lib/
│   │   └── pages/
│   └── README-MIGRATION.md
├── Dockerfile
├── compose.yaml
├── requirements.txt
└── README.md
```

---

## 5. Backend State

Framework:

```text
FastAPI
```

CORS currently allows:

```text
https://trade-web.hastenload.com
```

Current API root version:

```text
0.2.0
```

Implemented API groups:

```text
/api/v1/system
/api/v1/market
/api/v1/signals
/api/v1/strategies
/api/v1/backtest
/api/v1/risk
/api/v1/accounts
/api/v1/trading
```

Known working endpoints include:

```text
GET /
GET /health
GET /api/v1/system/status
GET /api/v1/market/status
GET /api/v1/market/quote/{symbol}
GET /api/v1/market/candles/{symbol}
GET /api/v1/trading/status
```

The `main` branch currently has:

```yaml
MARKET_PROVIDER: mock
```

The market provider is an abstraction layer. The goal is to later switch from
the mock provider to real providers / MT5 without rewriting frontend pages.

Live trading remains disabled until authentication, risk controls, persistence,
and broker/MT5 controls are implemented.

---

## 6. Frontend State

The frontend was migrated from the original **Base44 Global AI Trading Center**
project into this repository.

Production frontend technology:

```text
React + Vite + Tailwind-style component system
Nginx production container
```

Base44 is no longer intended to be the production backend.

The migrated application contains pages/features including:

```text
Dashboard
Markets
Charts
AI Signals
MT5 Trader
My Bots
Broker Accounts
Gold Reaper
AI Opportunities
News & Events
World Risk
Economic Calendar
Backtest
Signal History
Model Intelligence
System
Settings
Plans & Billing
```

Some frontend sections still use staged/demo/mock data from:

```text
web/src/lib/mockData.js
```

This is expected during migration. Replace mock data page-by-page with FastAPI
endpoints rather than doing a large blind rewrite.

A temporary compatibility file named:

```text
web/src/api/base44Client.js
```

may still exist. It is retained to avoid breaking migrated UI code. It must not
be treated as permission to reintroduce the Base44 backend. Backend operations
should progressively move to the Trade API.

---

## 7. Base44 Migration Rule

Base44 is now considered a **design/source reference**, not the target runtime.

Desired production architecture:

```text
React/Vite frontend
       |
       v
trade-api.hastenload.com
       |
       v
FastAPI
       |
       +--> market data
       +--> signals
       +--> strategies
       +--> risk engine
       +--> backtesting
       +--> persistence
       +--> MT5 / broker bridge
```

Do not place execution logic, broker passwords, API secrets, Cloudflare tokens,
or deterministic risk controls in browser code.

---

## 8. Git Branch / Migration Status

### `main`

Known stable production baseline.

Contains:

- migrated full React/Vite frontend
- FastAPI v1 architecture
- configurable `MARKET_PROVIDER=mock`
- working Docker deployment
- working Cloudflare frontend/API connectivity

### `dashboard-api-integration`

Work branch created to connect Dashboard market data to the Trade API.

Intended additions include:

- multi-asset mock market quotes
- batch market quote API
- `web/src/api/tradeApi.js`
- Dashboard backend status from Trade API
- Watchlist prices from API
- Watchlist / BTC candles from API
- periodic refresh

This branch should be tested before merging.

### `ui-heartbeat-logo-fix`

Based on `dashboard-api-integration`.

Intended additions include:

- real visual backend heartbeat card
- browser heartbeat request to `/health`
- backend latency display
- ECG-style animated pulse
- Global AI Trading Center logo in sidebar
- replacement of Base44 favicon
- branded web manifest

This branch should be tested before merging.

**Do not assume a feature is in `main` simply because it exists in one of these
branches. Check GitHub branch contents first.**

---

## 9. Known Operational Issue: Git Ownership

Earlier commands were sometimes run as `root`, while normal development uses
the `trad` account. This caused:

```text
error: insufficient permission for adding an object to repository database .git/objects
```

Preferred operational user:

```text
trad
```

If repository ownership becomes mixed, repair with:

```bash
sudo chown -R trad:trad /home/trad/Trade-app
chmod -R u+rwX /home/trad/Trade-app/.git
```

Avoid alternating between `root` and `trad` for normal Git work.

---

## 10. Cloudflare Tunnel Operating Pattern

The working API tunnel helper pattern securely reads the token without placing
it directly in the script:

```bash
docker rm -f cloudflared-api 2>/dev/null || true

read -rsp "Paste Trade-api tunnel token, then press ENTER: " CF_API_TOKEN
echo

if [ -z "$CF_API_TOKEN" ]; then
    echo "ERROR: Token is empty"
else
    echo "Token received. Length: ${#CF_API_TOKEN}"

    docker run -d \
      --name cloudflared-api \
      --restart unless-stopped \
      cloudflare/cloudflared:latest \
      tunnel --no-autoupdate run \
      --token "$CF_API_TOKEN"

    unset CF_API_TOKEN

    sleep 5

    echo "===== CONTAINER STATUS ====="
    docker ps --filter name=cloudflared-api

    echo
    echo "===== CLOUDFLARE LOGS ====="
    docker logs --tail 30 cloudflared-api
fi
```

Do not record the actual token in GitHub, documentation, prompts, or commits.

Current known Cloudflare routes:

```text
trade-web.hastenload.com -> http://10.0.0.56:8080
trade-api.hastenload.com -> http://10.0.0.56:8100
```

---

## 11. Standard Build / Validation Commands

From:

```bash
cd /home/trad/Trade-app
```

Build / start application:

```bash
docker compose up -d --build trade-api trade-web
```

Container status:

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

Validate public frontend:

```bash
curl -sS -o /dev/null -w "HTTP %{http_code}\n" \
  https://trade-web.hastenload.com/
```

Validate API:

```bash
curl -sS https://trade-api.hastenload.com/health
```

Validate market provider:

```bash
curl -sS https://trade-api.hastenload.com/api/v1/market/status
```

Expected current provider:

```text
MockMarketDataProvider
```

---

## 12. Git Workflow

Normal development should use the `trad` account.

Before changes:

```bash
cd /home/trad/Trade-app
git status
git branch --show-current
git fetch origin
```

For substantial changes, prefer a feature branch.

After a verified change:

```bash
git add .
git commit -m "Describe the verified change"
git push
git status
```

Do not commit:

- secrets
- Cloudflare tokens
- broker passwords
- private SSH keys
- production API credentials
- local `*.bak` files

---

## 13. How a New Chat Should Resume This Project

When starting a new ChatGPT conversation, the preferred instruction is:

```text
Open GitHub repository Austin-Texas/Trade-app.
Read PROJECT_CONTEXT.md first.
Then inspect README.md, the current main branch, git-relevant feature branches,
compose.yaml, and the files involved in my new request.
Do not assume Base44 is the backend.
Do not enable live trading unless I explicitly request it and required security
and risk controls are in place.
```

The assistant should then determine the current GitHub state before proposing or
making changes.

---

## 14. Update Policy for This File

Update `PROJECT_CONTEXT.md` whenever any of the following changes:

- public domain or hostname
- VM IP or port mapping
- Docker container names
- Cloudflare routing
- backend framework / API version
- active market-data provider
- database / persistence layer
- authentication model
- MT5 / broker architecture
- execution mode
- major frontend pages or features
- branch / release status
- deployment procedure
- important security rules

Keep this document concise enough to read quickly, but complete enough that a
new conversation can resume the project without relying on chat history.

---

## 15. Revision History

| Revision | Date | Summary |
|---|---|---|
| 2026-09-14-r1 | 2026-09-14 | Initial persistent project context created from the current self-hosted frontend, FastAPI backend, Docker/Cloudflare deployment, Base44 migration, branch state, and Git operating procedures. |
