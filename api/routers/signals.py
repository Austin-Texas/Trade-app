from fastapi import APIRouter

router = APIRouter(prefix="/signals", tags=["Signals"])


@router.get("/")
def list_signals():
    return {
        "signals": [],
        "count": 0
    }
