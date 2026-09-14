from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import (
    accounts,
    backtest,
    market,
    risk,
    signals,
    strategies,
    system,
    trading,
)

app = FastAPI(
    title="Global AI Trading Center API",
    version="0.2.0",
    description="Backend API for the Global AI Trading Center.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://trade-web.hastenload.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "trade-api",
        "name": "Global AI Trading Center",
        "version": "0.2.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


app.include_router(system.router, prefix="/api/v1")
app.include_router(market.router, prefix="/api/v1")
app.include_router(signals.router, prefix="/api/v1")
app.include_router(strategies.router, prefix="/api/v1")
app.include_router(backtest.router, prefix="/api/v1")
app.include_router(risk.router, prefix="/api/v1")
app.include_router(accounts.router, prefix="/api/v1")
app.include_router(trading.router, prefix="/api/v1")
