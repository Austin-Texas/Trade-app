from fastapi import APIRouter

router = APIRouter(prefix="/backtest", tags=["Backtest"])


@router.get("/status")
def backtest_status():
    return {
        "status": "ready",
        "active_jobs": 0
    }
