from datetime import datetime, timezone
from typing import Optional

import MetaTrader5 as mt5
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Global AI Trading Center MT5 Bridge", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://trade-web.hastenload.com"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MT5ConnectRequest(BaseModel):
    server: str
    login: str
    password: str
    access_mode: str = "read_only"


class MT5OrderRequest(BaseModel):
    symbol: str
    side: str
    volume: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    deviation: int = 20
    comment: str = "GlobalAITradingCenter"


_connected_login: Optional[int] = None
_connected_server: Optional[str] = None


def _require_account_info():
    info = mt5.account_info()
    if info is None:
        raise HTTPException(status_code=503, detail=f"MT5 account unavailable: {mt5.last_error()}")
    return info


def _require_demo_account():
    info = _require_account_info()
    # MetaTrader5 ACCOUNT_TRADE_MODE_DEMO is 0.
    if getattr(info, "trade_mode", None) != 0:
        raise HTTPException(status_code=403, detail="Execution is enabled for DEMO accounts only.")
    return info


def _account_payload(info):
    positions = mt5.positions_get()
    position_count = 0 if positions is None else len(positions)
    login_text = str(info.login)
    masked = ("•" * max(0, len(login_text) - 4)) + login_text[-4:]
    return {
        "status": "connected",
        "environment": "demo" if getattr(info, "trade_mode", 0) == 0 else "live",
        "account_masked": masked,
        "currency": info.currency,
        "balance": info.balance,
        "equity": info.equity,
        "margin": info.margin,
        "free_margin": info.margin_free,
        "profit": info.profit,
        "open_positions": position_count,
        "last_sync": datetime.now(timezone.utc).isoformat(),
        "server": _connected_server,
    }


def _position_payload(p):
    return {
        "ticket": p.ticket,
        "symbol": p.symbol,
        "type": "buy" if p.type == mt5.POSITION_TYPE_BUY else "sell",
        "volume": p.volume,
        "price_open": p.price_open,
        "price_current": p.price_current,
        "sl": p.sl,
        "tp": p.tp,
        "profit": p.profit,
        "swap": p.swap,
        "time": datetime.fromtimestamp(p.time, tz=timezone.utc).isoformat(),
    }


def _ensure_symbol(symbol: str):
    info = mt5.symbol_info(symbol)
    if info is None:
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found in MT5.")
    if not info.visible and not mt5.symbol_select(symbol, True):
        raise HTTPException(status_code=400, detail=f"Unable to enable symbol {symbol}.")
    return info


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": "mt5-bridge", "version": "0.2.0"}


@app.post("/api/v1/mt5/connect")
def connect_mt5(req: MT5ConnectRequest):
    global _connected_login, _connected_server
    try:
        login = int(req.login)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="MT5 login must be numeric.") from exc

    if not mt5.initialize(login=login, server=req.server, password=req.password):
        code, message = mt5.last_error()
        mt5.shutdown()
        raise HTTPException(status_code=401, detail=f"MT5 connection failed: {code} {message}")

    _connected_login = login
    _connected_server = req.server
    payload = _account_payload(_require_account_info())
    payload["message"] = "MetaTrader 5 connected successfully."
    return payload


@app.post("/api/v1/mt5/disconnect")
def disconnect_mt5():
    global _connected_login, _connected_server
    mt5.shutdown()
    _connected_login = None
    _connected_server = None
    return {"status": "disconnected"}


@app.get("/api/v1/mt5/account")
def account():
    return _account_payload(_require_account_info())


@app.get("/api/v1/mt5/positions")
def positions():
    _require_account_info()
    rows = mt5.positions_get()
    if rows is None:
        code, message = mt5.last_error()
        raise HTTPException(status_code=503, detail=f"Unable to read MT5 positions: {code} {message}")
    return {"positions": [_position_payload(p) for p in rows], "count": len(rows)}


@app.post("/api/v1/mt5/order")
def place_order(req: MT5OrderRequest):
    _require_demo_account()
    side = req.side.lower().strip()
    if side not in {"buy", "sell"}:
        raise HTTPException(status_code=400, detail="side must be buy or sell")
    if req.volume <= 0:
        raise HTTPException(status_code=400, detail="volume must be greater than 0")

    info = _ensure_symbol(req.symbol)
    tick = mt5.symbol_info_tick(req.symbol)
    if tick is None:
        raise HTTPException(status_code=503, detail=f"No live tick for {req.symbol}.")

    order_type = mt5.ORDER_TYPE_BUY if side == "buy" else mt5.ORDER_TYPE_SELL
    price = tick.ask if side == "buy" else tick.bid

    # Normalize volume to the broker's allowed range/step.
    volume = max(info.volume_min, min(req.volume, info.volume_max))
    if info.volume_step:
        steps = round(volume / info.volume_step)
        volume = steps * info.volume_step

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": req.symbol,
        "volume": float(volume),
        "type": order_type,
        "price": price,
        "deviation": req.deviation,
        "magic": 560056,
        "comment": req.comment,
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": info.filling_mode,
    }
    if req.stop_loss and req.stop_loss > 0:
        request["sl"] = float(req.stop_loss)
    if req.take_profit and req.take_profit > 0:
        request["tp"] = float(req.take_profit)

    result = mt5.order_send(request)
    if result is None:
        code, message = mt5.last_error()
        raise HTTPException(status_code=500, detail=f"order_send failed: {code} {message}")

    if result.retcode not in {mt5.TRADE_RETCODE_DONE, mt5.TRADE_RETCODE_PLACED, mt5.TRADE_RETCODE_DONE_PARTIAL}:
        raise HTTPException(status_code=400, detail=f"MT5 rejected order: {result.retcode} {result.comment}")

    return {
        "status": "filled" if result.retcode == mt5.TRADE_RETCODE_DONE else "accepted",
        "order": result.order,
        "deal": result.deal,
        "symbol": req.symbol,
        "side": side,
        "volume": volume,
        "price": result.price or price,
        "retcode": result.retcode,
        "comment": result.comment,
        "account": _account_payload(_require_account_info()),
    }


@app.post("/api/v1/mt5/positions/{ticket}/close")
def close_position(ticket: int):
    _require_demo_account()
    rows = mt5.positions_get(ticket=ticket)
    if not rows:
        raise HTTPException(status_code=404, detail=f"Position {ticket} not found.")
    p = rows[0]
    info = _ensure_symbol(p.symbol)
    tick = mt5.symbol_info_tick(p.symbol)
    if tick is None:
        raise HTTPException(status_code=503, detail=f"No live tick for {p.symbol}.")

    closing_type = mt5.ORDER_TYPE_SELL if p.type == mt5.POSITION_TYPE_BUY else mt5.ORDER_TYPE_BUY
    price = tick.bid if closing_type == mt5.ORDER_TYPE_SELL else tick.ask
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "position": p.ticket,
        "symbol": p.symbol,
        "volume": p.volume,
        "type": closing_type,
        "price": price,
        "deviation": 20,
        "magic": 560056,
        "comment": "GlobalAITradingCenter close",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": info.filling_mode,
    }
    result = mt5.order_send(request)
    if result is None:
        code, message = mt5.last_error()
        raise HTTPException(status_code=500, detail=f"close failed: {code} {message}")
    if result.retcode not in {mt5.TRADE_RETCODE_DONE, mt5.TRADE_RETCODE_PLACED, mt5.TRADE_RETCODE_DONE_PARTIAL}:
        raise HTTPException(status_code=400, detail=f"MT5 rejected close: {result.retcode} {result.comment}")
    return {"status": "closed", "ticket": ticket, "retcode": result.retcode, "comment": result.comment}