from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter(prefix="/system", tags=["System"])


@router.get("/status")
def system_status():
    return {
        "service": "Global AI Trading Center",
        "api_version": "v1",
        "status": "online",
        "trading_enabled": False,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
