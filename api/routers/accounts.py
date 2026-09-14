from fastapi import APIRouter

router = APIRouter(prefix="/accounts", tags=["Accounts"])


@router.get("/")
def list_accounts():
    return {
        "accounts": [],
        "count": 0,
        "broker_connected": False
    }
