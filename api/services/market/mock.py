from datetime import datetime, timedelta, timezone
import random

from api.services.market.base import MarketDataProvider


SYMBOLS = {
    "BTCUSD": {"name": "Bitcoin / USD", "category": "Crypto", "base": 67412.18, "volume": 28400000000, "spread": 8.0},
    "ETHUSD": {"name": "Ethereum / USD", "category": "Crypto", "base": 2618.92, "volume": 12100000000, "spread": 0.8},
    "SOLUSD": {"name": "Solana / USD", "category": "Crypto", "base": 148.33, "volume": 3900000000, "spread": 0.08},
    "NVDA": {"name": "NVIDIA Corp.", "category": "US Stocks", "base": 138.07, "volume": 218400000, "spread": 0.03},
    "AAPL": {"name": "Apple Inc.", "category": "US Stocks", "base": 231.42, "volume": 48120000, "spread": 0.02},
    "TSLA": {"name": "Tesla Inc.", "category": "US Stocks", "base": 248.91, "volume": 98700000, "spread": 0.04},
    "SPY": {"name": "SPDR S&P 500 ETF", "category": "ETFs", "base": 583.11, "volume": 41200000, "spread": 0.02},
    "EURUSD": {"name": "Euro / US Dollar", "category": "Forex", "base": 1.0942, "volume": 0, "spread": 0.0002},
    "GBPUSD": {"name": "British Pound / USD", "category": "Forex", "base": 1.3188, "volume": 0, "spread": 0.0002},
    "USDJPY": {"name": "US Dollar / Yen", "category": "Forex", "base": 149.82, "volume": 0, "spread": 0.02},
    "XAUUSD": {"name": "Gold Spot / USD", "category": "Commodities", "base": 2658.40, "volume": 0, "spread": 0.30},
    "XAGUSD": {"name": "Silver Spot / USD", "category": "Commodities", "base": 31.42, "volume": 0, "spread": 0.02},
    "USOIL": {"name": "WTI Crude Oil", "category": "Commodities", "base": 71.22, "volume": 0, "spread": 0.03},
}


def _meta(symbol: str) -> dict:
    symbol = symbol.upper()
    if symbol in SYMBOLS:
        return SYMBOLS[symbol]

    seed = sum(ord(ch) for ch in symbol)
    return {
        "name": symbol,
        "category": "Other",
        "base": round(25 + (seed % 5000) / 10, 4),
        "volume": 0,
        "spread": 0.01,
    }


def _precision(price: float) -> int:
    if price < 10:
        return 5
    if price < 1000:
        return 2
    return 2


def _volatility(category: str) -> float:
    return {
        "Crypto": 0.018,
        "US Stocks": 0.010,
        "ETFs": 0.006,
        "Forex": 0.0025,
        "Commodities": 0.008,
    }.get(category, 0.007)


class MockMarketDataProvider(MarketDataProvider):

    def get_quote(self, symbol: str) -> dict:
        symbol = symbol.upper()
        meta = _meta(symbol)
        rng = random.Random(f"quote:{symbol}")
        pct_move = (rng.random() - 0.48) * _volatility(meta["category"]) * 2
        change = meta["base"] * pct_move
        price = meta["base"] + change
        spread = meta["spread"]
        precision = _precision(price)

        return {
            "symbol": symbol,
            "name": meta["name"],
            "category": meta["category"],
            "price": round(price, precision),
            "bid": round(price - spread / 2, precision),
            "ask": round(price + spread / 2, precision),
            "mid": round(price, precision),
            "change": round(change, precision),
            "changePct": round(pct_move * 100, 3),
            "volume": meta["volume"],
            "market": "open",
            "provider": "mock",
            "live_market_data": False,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def get_candles(
        self,
        symbol: str,
        timeframe: str,
        limit: int = 100
    ) -> dict:
        symbol = symbol.upper()
        meta = _meta(symbol)
        timeframe = timeframe.lower()
        rng = random.Random(f"candles:{symbol}:{timeframe}")
        volatility = _volatility(meta["category"])
        precision = _precision(meta["base"])
        price = meta["base"]
        now = datetime.now(timezone.utc)

        step = {
            "1m": timedelta(minutes=1),
            "5m": timedelta(minutes=5),
            "15m": timedelta(minutes=15),
            "30m": timedelta(minutes=30),
            "1h": timedelta(hours=1),
            "4h": timedelta(hours=4),
            "1d": timedelta(days=1),
            "1w": timedelta(weeks=1),
        }.get(timeframe, timedelta(hours=1))

        candles = []

        for i in range(limit):
            open_price = price
            drift = (rng.random() - 0.47) * volatility * meta["base"]
            close_price = max(0.00001, open_price + drift)
            wick = volatility * meta["base"] * (0.15 + rng.random() * 0.35)
            high = max(open_price, close_price) + wick
            low = max(0.00001, min(open_price, close_price) - wick)
            volume = int(max(1, (meta["volume"] or 100000) / max(limit, 1) * (0.6 + rng.random())))
            timestamp = now - step * (limit - i)

            candles.append({
                "index": i,
                "time": timestamp.isoformat(),
                "open": round(open_price, precision),
                "high": round(high, precision),
                "low": round(low, precision),
                "close": round(close_price, precision),
                "volume": volume,
            })
            price = close_price

        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "provider": "mock",
            "live_market_data": False,
            "count": len(candles),
            "candles": candles,
        }
