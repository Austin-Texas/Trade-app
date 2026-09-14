from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/trading", tags=["Trading"])


@router.get("/status")
def trading_status():
    return {
        "enabled": False,
        "mode": "disabled",
        "message": "Live trading is locked until authentication and risk controls are configured."
    }


@router.post("/orders")
def create_order():
    raise HTTPException(
        status_code=423,
        detail="Live order execution is currently locked."
    )
