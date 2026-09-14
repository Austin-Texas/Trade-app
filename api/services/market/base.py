from abc import ABC, abstractmethod


class MarketDataProvider(ABC):

    @abstractmethod
    def get_quote(self, symbol: str) -> dict:
        pass

    @abstractmethod
    def get_candles(
        self,
        symbol: str,
        timeframe: str,
        limit: int = 100
    ) -> dict:
        pass
