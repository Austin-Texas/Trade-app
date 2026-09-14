from fastapi import APIRouter

router = APIRouter(prefix="/risk", tags=["Risk"])


@router.get("/status")
def risk_status():
    return {
        "status": "ready",
        "live_trading_allowed": False,
        "max_risk_per_trade": None,
        "daily_loss_limit": None
    }
