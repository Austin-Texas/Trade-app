import os

from api.services.market.mock import MockMarketDataProvider


def get_market_provider():
    provider_name = os.getenv("MARKET_PROVIDER", "mock").lower()

    if provider_name == "mock":
        return MockMarketDataProvider()

    raise RuntimeError(
        f"Unsupported MARKET_PROVIDER: {provider_name}"
    )
