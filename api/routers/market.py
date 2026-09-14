import os

from fastapi import APIRouter, HTTPException, Query

from api.services.market.factory import get_market_provider

router = APIRouter(prefix="/market", tags=["Market"])


@router.get("/status")
def market_status():
    provider = get_market_provider()
    provider_name = os.getenv("MARKET_PROVIDER", "mock").lower()

    return {
        "status": "connected",
        "provider": provider.__class__.__name__,
        "mode": provider_name,
        "live_market_data": provider_name != "mock",
    }


@router.get("/quotes")
def get_quotes(
    symbols: str = Query(..., description="Comma-separated symbols"),
):
    requested = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    if not requested:
        raise HTTPException(status_code=400, detail="At least one symbol is required.")
    if len(requested) > 50:
        raise HTTPException(status_code=400, detail="Maximum 50 symbols per request.")

    try:
        provider = get_market_provider()
        quotes = [provider.get_quote(symbol) for symbol in requested]
        return {
            "provider": provider.__class__.__name__,
            "count": len(quotes),
            "quotes": quotes,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/quote/{symbol}")
def get_quote(symbol: str):
    try:
        provider = get_market_provider()
        return provider.get_quote(symbol)

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc)
        )


@router.get("/candles/{symbol}")
def get_candles(
    symbol: str,
    timeframe: str = Query(default="1h"),
    limit: int = Query(default=100, ge=1, le=1000),
):
    try:
        provider = get_market_provider()

        return provider.get_candles(
            symbol=symbol,
            timeframe=timeframe,
            limit=limit,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc)
        )
