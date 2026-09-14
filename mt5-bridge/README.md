# MT5 Bridge (test/read-only)

This service is designed to run on a Windows machine or Windows VM that has MetaTrader 5 installed. It exposes a small HTTP API for the Global AI Trading Center.

## Endpoints

- `GET /api/v1/health`
- `POST /api/v1/mt5/connect`
- `POST /api/v1/mt5/disconnect`
- `GET /api/v1/mt5/account`
- `GET /api/v1/mt5/positions`

## Install on Windows

1. Install MetaTrader 5 and sign in once to confirm the terminal works.
2. Install Python 3.11 or 3.12.
3. Open PowerShell in this folder.
4. Create and activate a virtual environment:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

5. Install dependencies:

```powershell
pip install -r requirements.txt
```

6. Start the API:

```powershell
uvicorn app:app --host 0.0.0.0 --port 8000
```

7. Test locally:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/health
```

## Base44 settings

Set the Global AI Trading Center Settings page Backend API Base URL to the HTTPS URL that reaches this bridge (directly for testing, or preferably through the Linux backend/reverse proxy).

Example endpoint expected by the web UI:

```text
https://your-domain.example.com/api/v1/mt5/connect
```

## Security

This version intentionally accepts credentials only in the POST request from the Settings screen and does not write them to a file or source code. Use the investor/read-only password for testing. Before exposing this service to the internet, restrict CORS, add authentication, put it behind HTTPS, and firewall it so only your backend can reach it.