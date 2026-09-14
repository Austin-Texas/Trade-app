from datetime import datetime, timezone

from api.services.market.base import MarketDataProvider


class MockMarketDataProvider(MarketDataProvider):

    def get_quote(self, symbol: str) -> dict:
        symbol = symbol.upper()

        return {
            "symbol": symbol,
            "bid": 1.1000,
            "ask": 1.1002,
            "mid": 1.1001,
            "provider": "mock",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def get_candles(
        self,
        symbol: str,
        timeframe: str,
        limit: int = 100
    ) -> dict:

        symbol = symbol.upper()

        candles = []

        for i in range(limit):
            base = 1.1000 + (i * 0.0001)

            candles.append({
                "index": i,
                "open": round(base, 5),
                "high": round(base + 0.0005, 5),
                "low": round(base - 0.0005, 5),
                "close": round(base + 0.0002, 5),
                "volume": 1000 + i,
            })

        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "provider": "mock",
            "count": len(candles),
            "candles": candles,
        }
