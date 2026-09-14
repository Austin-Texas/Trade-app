from fastapi import APIRouter

router = APIRouter(prefix="/strategies", tags=["Strategies"])


@router.get("/")
def list_strategies():
    return {
        "strategies": [],
        "count": 0
    }
