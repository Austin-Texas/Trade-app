from fastapi import APIRouter

router = APIRouter(prefix="/market", tags=["Market"])


@router.get("/status")
def market_status():
    return {
        "status": "not_connected",
        "provider": None,
        "message": "Market-data provider has not been configured yet."
    }
