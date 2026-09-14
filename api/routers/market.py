from fastapi import APIRouter, HTTPException, Query

from api.services.market.factory import get_market_provider

router = APIRouter(prefix="/market", tags=["Market"])


@router.get("/status")
def market_status():
    provider = get_market_provider()

    return {
        "status": "connected",
        "provider": provider.__class__.__name__,
        "mode": "mock",
        "live_market_data": False,
    }


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
