from datetime import datetime, timezone
from typing import Optional
import MetaTrader5 as mt5
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Global AI Trading Center MT5 Bridge", version="0.4.1")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])
MAGIC=560056
_connected_server: Optional[str]=None
_day_key: Optional[str]=None
_day_start_equity: Optional[float]=None

class ConnectReq(BaseModel): server:str; login:str; password:str; access_mode:str="demo_trade"
class OrderReq(BaseModel): symbol:str; side:str; volume:Optional[float]=None; risk_percent:Optional[float]=None; stop_loss:Optional[float]=None; take_profit:Optional[float]=None; deviation:int=20; comment:str="GlobalAITradingCenter"
class ModifyReq(BaseModel): stop_loss:Optional[float]=None; take_profit:Optional[float]=None
class ManageReq(BaseModel): trailing_enabled:bool=False; trailing_distance_points:float=150; profit_target_usd:Optional[float]=None; max_drawdown_percent:Optional[float]=None; close_all_on_profit_target:bool=True

def account_info():
    x=mt5.account_info()
    if x is None: raise HTTPException(503,f"MT5 account unavailable: {mt5.last_error()}")
    return x

def demo_account():
    x=account_info()
    if getattr(x,"trade_mode",None)!=0: raise HTTPException(403,"Execution is enabled for DEMO accounts only.")
    return x

def symbol_info(symbol):
    x=mt5.symbol_info(symbol)
    if x is None: raise HTTPException(404,f"Symbol {symbol} not found")
    if not x.visible and not mt5.symbol_select(symbol,True): raise HTTPException(400,f"Unable to enable {symbol}")
    return x

def norm_volume(i,v):
    v=max(i.volume_min,min(float(v),i.volume_max))
    if i.volume_step: v=round(v/i.volume_step)*i.volume_step
    return round(v,8)

def account_payload(x):
    rows=mt5.positions_get() or []
    return {"status":"connected","environment":"demo" if getattr(x,"trade_mode",0)==0 else "live","account_masked":("•"*max(0,len(str(x.login))-4))+str(x.login)[-4:],"currency":x.currency,"balance":x.balance,"equity":x.equity,"margin":x.margin,"free_margin":x.margin_free,"margin_level":getattr(x,"margin_level",0),"profit":x.profit,"open_positions":len(rows),"leverage":getattr(x,"leverage",None),"last_sync":datetime.now(timezone.utc).isoformat(),"server":_connected_server}

def position_payload(p):
    return {"ticket":p.ticket,"symbol":p.symbol,"type":"buy" if p.type==mt5.POSITION_TYPE_BUY else "sell","volume":p.volume,"price_open":p.price_open,"price_current":p.price_current,"sl":p.sl,"tp":p.tp,"profit":p.profit,"swap":p.swap,"magic":p.magic,"time":datetime.fromtimestamp(p.time,tz=timezone.utc).isoformat()}

def daily_stats():
    now=datetime.now(timezone.utc); start=datetime(now.year,now.month,now.day,tzinfo=timezone.utc); deals=mt5.history_deals_get(start,now) or []; profit=0.; trades=0
    for d in deals:
        if getattr(d,"magic",0)!=MAGIC: continue
        profit+=float(getattr(d,"profit",0) or 0)+float(getattr(d,"commission",0) or 0)+float(getattr(d,"swap",0) or 0)
        if getattr(d,"entry",None) in {mt5.DEAL_ENTRY_IN,getattr(mt5,"DEAL_ENTRY_INOUT",-1)}: trades+=1
    return {"date":start.date().isoformat(),"realized_profit":profit,"trades":trades}

def drawdown_state(info):
    global _day_key,_day_start_equity
    today=datetime.now(timezone.utc).date().isoformat()
    if _day_key!=today or _day_start_equity is None:
        st=daily_stats(); _day_key=today; _day_start_equity=max(.01,float(info.equity)-float(info.profit)-float(st["realized_profit"]))
    return {"day_start_equity":_day_start_equity,"drawdown_percent":max(0.,(_day_start_equity-float(info.equity))/_day_start_equity*100.)}

def risk_volume(symbol,side,stop,risk):
    a=account_info(); i=symbol_info(symbol); tick=mt5.symbol_info_tick(symbol)
    if tick is None: raise HTTPException(503,f"No live tick for {symbol}")
    if risk<=0 or risk>10: raise HTTPException(400,"risk_percent must be >0 and <=10")
    typ=mt5.ORDER_TYPE_BUY if side=="buy" else mt5.ORDER_TYPE_SELL; entry=tick.ask if side=="buy" else tick.bid; loss=mt5.order_calc_profit(typ,symbol,1.,entry,float(stop))
    if loss is None or abs(loss)<.01: raise HTTPException(400,"Unable to calculate risk volume")
    amount=float(a.equity)*risk/100.; return norm_volume(i,amount/abs(loss))

def close_one(p,deviation=20):
    i=symbol_info(p.symbol); tick=mt5.symbol_info_tick(p.symbol)
    if tick is None: raise HTTPException(503,f"No live tick for {p.symbol}")
    typ=mt5.ORDER_TYPE_SELL if p.type==mt5.POSITION_TYPE_BUY else mt5.ORDER_TYPE_BUY; price=tick.bid if typ==mt5.ORDER_TYPE_SELL else tick.ask
    r=mt5.order_send({"action":mt5.TRADE_ACTION_DEAL,"position":p.ticket,"symbol":p.symbol,"volume":p.volume,"type":typ,"price":price,"deviation":deviation,"magic":MAGIC,"comment":"GlobalAI close","type_time":mt5.ORDER_TIME_GTC,"type_filling":i.filling_mode})
    if r is None or r.retcode not in {mt5.TRADE_RETCODE_DONE,mt5.TRADE_RETCODE_PLACED,mt5.TRADE_RETCODE_DONE_PARTIAL}: raise HTTPException(400,f"Close rejected: {mt5.last_error() if r is None else r.comment}")
    return r

@app.get("/api/v1/health")
def health(): return {"status":"ok","service":"mt5-bridge","version":"0.4.1","mt5_initialized":mt5.terminal_info() is not None}

@app.post("/api/v1/mt5/connect")
def connect(req:ConnectReq):
    global _connected_server,_day_key,_day_start_equity
    try: login=int(req.login)
    except ValueError: raise HTTPException(400,"MT5 login must be numeric")
    if not mt5.initialize(login=login,server=req.server,password=req.password):
        code,msg=mt5.last_error(); mt5.shutdown(); raise HTTPException(401,f"MT5 connection failed: {code} {msg}")
    _connected_server=req.server; _day_key=None; _day_start_equity=None; p=account_payload(account_info()); p["message"]="MetaTrader 5 connected successfully."; return p

@app.post("/api/v1/mt5/disconnect")
def disconnect(): mt5.shutdown(); return {"status":"disconnected"}

@app.get("/api/v1/mt5/account")
def account():
    x=account_info(); p=account_payload(x); p.update(drawdown_state(x)); p.update(daily_stats()); return p

@app.get("/api/v1/mt5/positions")
def positions(): return {"positions":[position_payload(p) for p in (mt5.positions_get() or [])],"count":len(mt5.positions_get() or [])}

@app.get("/api/v1/mt5/symbol/{symbol}")
def snapshot(symbol:str):
    i=symbol_info(symbol); t=mt5.symbol_info_tick(symbol)
    if t is None: raise HTTPException(503,f"No live tick for {symbol}")
    point=i.point or .00001
    return {"symbol":symbol,"bid":t.bid,"ask":t.ask,"last":t.last,"spread_points":(t.ask-t.bid)/point,"point":point,"digits":i.digits,"volume_min":i.volume_min,"volume_max":i.volume_max,"volume_step":i.volume_step,"tick_time":datetime.fromtimestamp(t.time,tz=timezone.utc).isoformat()}

@app.get("/api/v1/mt5/candles/{symbol}")
def candles(symbol:str,timeframe:str="M1",count:int=240):
    symbol_info(symbol); m={"M1":mt5.TIMEFRAME_M1,"M5":mt5.TIMEFRAME_M5,"M15":mt5.TIMEFRAME_M15,"M30":mt5.TIMEFRAME_M30,"H1":mt5.TIMEFRAME_H1,"H4":mt5.TIMEFRAME_H4,"D1":mt5.TIMEFRAME_D1}; tf=m.get(timeframe.upper())
    if tf is None: raise HTTPException(400,"Unsupported timeframe")
    rates=mt5.copy_rates_from_pos(symbol,tf,0,max(20,min(count,2000)))
    if rates is None or len(rates)==0: raise HTTPException(503,"No candle data")
    rows=[{"time":int(r["time"])*1000,"open":float(r["open"]),"high":float(r["high"]),"low":float(r["low"]),"close":float(r["close"]),"volume":int(r["tick_volume"]),"spread":int(r["spread"])} for r in rates]; trs=[]
    for n,r in enumerate(rows):
        prev=rows[n-1]["close"] if n else r["open"]; trs.append(max(r["high"]-r["low"],abs(r["high"]-prev),abs(r["low"]-prev)))
    atr=sum(trs[-14:])/min(14,len(trs)); current=rows[-1]["high"]-rows[-1]["low"]; vols=[r["volume"] for r in rows[-20:]]; base=sum(vols[:-1])/max(1,len(vols)-1)
    return {"symbol":symbol,"timeframe":timeframe.upper(),"candles":rows,"atr14":atr,"candle_atr_multiple":current/atr if atr else 0,"tick_activity_ratio":rows[-1]["volume"]/base if base else 1}

@app.post("/api/v1/mt5/order")
def order(req:OrderReq):
    demo_account(); side=req.side.lower().strip()
    if side not in {"buy","sell"}: raise HTTPException(400,"side must be buy or sell")
    i=symbol_info(req.symbol); t=mt5.symbol_info_tick(req.symbol)
    if t is None: raise HTTPException(503,"No live tick")
    typ=mt5.ORDER_TYPE_BUY if side=="buy" else mt5.ORDER_TYPE_SELL; price=t.ask if side=="buy" else t.bid; volume=req.volume
    if req.risk_percent is not None and req.stop_loss: volume=risk_volume(req.symbol,side,req.stop_loss,req.risk_percent)
    if not volume or volume<=0: raise HTTPException(400,"Provide volume or risk_percent with stop_loss")
    q={"action":mt5.TRADE_ACTION_DEAL,"symbol":req.symbol,"volume":norm_volume(i,volume),"type":typ,"price":price,"deviation":req.deviation,"magic":MAGIC,"comment":req.comment,"type_time":mt5.ORDER_TIME_GTC,"type_filling":i.filling_mode}
    if req.stop_loss: q["sl"]=float(req.stop_loss)
    if req.take_profit: q["tp"]=float(req.take_profit)
    if mt5.order_check(q) is None: raise HTTPException(400,f"order_check failed: {mt5.last_error()}")
    r=mt5.order_send(q)
    if r is None or r.retcode not in {mt5.TRADE_RETCODE_DONE,mt5.TRADE_RETCODE_PLACED,mt5.TRADE_RETCODE_DONE_PARTIAL}: raise HTTPException(400,f"MT5 rejected order: {mt5.last_error() if r is None else r.comment}")
    return {"status":"accepted","order":r.order,"deal":r.deal,"symbol":req.symbol,"side":side,"volume":q["volume"],"price":r.price or price}

@app.post("/api/v1/mt5/positions/{ticket}/modify")
def modify(ticket:int,req:ModifyReq):
    demo_account(); rows=mt5.positions_get(ticket=ticket)
    if not rows: raise HTTPException(404,"Position not found")
    p=rows[0]; q={"action":mt5.TRADE_ACTION_SLTP,"position":p.ticket,"symbol":p.symbol,"sl":float(req.stop_loss or p.sl or 0),"tp":float(req.take_profit or p.tp or 0),"magic":MAGIC}; r=mt5.order_send(q)
    if r is None or r.retcode!=mt5.TRADE_RETCODE_DONE: raise HTTPException(400,"Modify failed")
    return {"status":"modified","ticket":ticket,"sl":q["sl"],"tp":q["tp"]}

@app.post("/api/v1/mt5/positions/{ticket}/close")
def close(ticket:int):
    demo_account(); rows=mt5.positions_get(ticket=ticket)
    if not rows: raise HTTPException(404,"Position not found")
    r=close_one(rows[0]); return {"status":"closed","ticket":ticket,"retcode":r.retcode}

@app.post("/api/v1/mt5/positions/close-all")
def close_all():
    demo_account(); rows=list(mt5.positions_get() or []); out=[]
    for p in rows:
        try: r=close_one(p); out.append({"ticket":p.ticket,"status":"closed","retcode":r.retcode})
        except HTTPException as e: out.append({"ticket":p.ticket,"status":"failed","detail":e.detail})
    return {"requested":len(rows),"closed":sum(x["status"]=="closed" for x in out),"results":out}

@app.post("/api/v1/mt5/manage")
def manage(req:ManageReq):
    info=demo_account(); rows=list(mt5.positions_get() or []); dd=drawdown_state(info)["drawdown_percent"]; profit=sum(float(p.profit) for p in rows); reached=req.profit_target_usd is not None and profit>=req.profit_target_usd; dd_reached=req.max_drawdown_percent is not None and dd>=req.max_drawdown_percent; actions=[]
    if reached and req.close_all_on_profit_target:
        for p in rows:
            try: close_one(p); actions.append({"ticket":p.ticket,"action":"close_profit_target"})
            except HTTPException as e: actions.append({"ticket":p.ticket,"action":"close_failed","detail":e.detail})
    elif req.trailing_enabled:
        for p in rows:
            i=symbol_info(p.symbol); dist=max(1,req.trailing_distance_points)*(i.point or .00001); candidate=p.price_current-dist if p.type==mt5.POSITION_TYPE_BUY else p.price_current+dist; improves=(p.type==mt5.POSITION_TYPE_BUY and candidate>(p.sl or 0) and candidate>p.price_open) or (p.type!=mt5.POSITION_TYPE_BUY and (p.sl==0 or candidate<p.sl) and candidate<p.price_open)
            if improves:
                r=mt5.order_send({"action":mt5.TRADE_ACTION_SLTP,"position":p.ticket,"symbol":p.symbol,"sl":float(candidate),"tp":float(p.tp or 0),"magic":MAGIC})
                if r is not None and r.retcode==mt5.TRADE_RETCODE_DONE: actions.append({"ticket":p.ticket,"action":"trail_stop","sl":candidate})
    return {"open_profit":profit,"profit_target_reached":reached,"drawdown_percent":dd,"drawdown_limit_reached":dd_reached,"entries_blocked":reached or dd_reached,"actions":actions,"positions":[position_payload(p) for p in (mt5.positions_get() or [])],"daily":daily_stats(),"account":account_payload(account_info())}
