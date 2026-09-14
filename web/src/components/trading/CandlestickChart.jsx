import React, { useMemo } from "react";
import { candleData } from "@/lib/mockData";

function ema(values, period) {
  const k = 2 / (period + 1);
  const out = [];
  let prev = values[0];
  values.forEach((v, i) => {
    prev = i === 0 ? v : v * k + prev * (1 - k);
    out.push(prev);
  });
  return out;
}

export default function CandlestickChart({
  symbol = "BTCUSD",
  height = 360,
  showVolume = true,
  data = null,
}) {
  const candles = useMemo(
    () => data || candleData[symbol] || Object.values(candleData)[0],
    [data, symbol]
  );

  if (!candles || candles.length === 0) return null;

  const closes = candles.map((c) => c.close);
  const ema9 = ema(closes, 9);
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const allHigh = Math.max(...candles.map((c) => c.high));
  const allLow = Math.min(...candles.map((c) => c.low));
  const maxVol = Math.max(...candles.map((c) => c.volume || 0), 1);
  const priceRange = allHigh - allLow || 1;

  const chartH = showVolume ? height * 0.72 : height;
  const volH = showVolume ? height * 0.18 : 0;
  const gap = showVolume ? height * 0.04 : 0;
  const w = 720;
  const pad = 6;
  const cw = (w - pad * 2) / candles.length;
  const bw = Math.max(2, cw * 0.62);

  const y = (price) => pad + (allHigh - price) / priceRange * (chartH - pad * 2);
  const vy = (vol) => chartH + gap + (1 - (vol || 0) / maxVol) * volH;
  const line = (arr) =>
    arr.map((v, i) => `${pad + i * cw + cw / 2},${y(v)}`).join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg width={w} height={height} className="block" style={{ minWidth: w }}>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={w - pad}
            y1={pad + f * (chartH - pad * 2)}
            y2={pad + f * (chartH - pad * 2)}
            stroke="hsl(var(--border))"
            strokeWidth={0.5}
            strokeDasharray="2 3"
          />
        ))}

        {candles.map((c, i) => {
          const cx = pad + i * cw + cw / 2;
          const up = c.close >= c.open;
          const color = up ? "hsl(var(--bull))" : "hsl(var(--bear))";
          return (
            <g key={i}>
              <line x1={cx} x2={cx} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth={1} />
              <rect
                x={cx - bw / 2}
                y={y(Math.max(c.open, c.close))}
                width={bw}
                height={Math.max(1, Math.abs(y(c.open) - y(c.close)))}
                fill={color}
                opacity={0.9}
              />
            </g>
          );
        })}

        <polyline points={line(ema9)} fill="none" stroke="hsl(var(--warn))" strokeWidth={1} opacity={0.9} />
        <polyline points={line(ema20)} fill="none" stroke="hsl(var(--primary))" strokeWidth={1} opacity={0.9} />
        <polyline points={line(ema50)} fill="none" stroke="hsl(var(--chart-5))" strokeWidth={1} opacity={0.8} />

        {showVolume &&
          candles.map((c, i) => {
            const cx = pad + i * cw + cw / 2;
            const up = c.close >= c.open;
            return (
              <rect
                key={i}
                x={cx - bw / 2}
                y={vy(c.volume)}
                width={bw}
                height={chartH + gap + volH - vy(c.volume)}
                fill={up ? "hsl(var(--bull))" : "hsl(var(--bear))"}
                opacity={0.25}
              />
            );
          })}

        <line
          x1={pad}
          x2={w - pad}
          y1={y(closes[closes.length - 1])}
          y2={y(closes[closes.length - 1])}
          stroke="hsl(var(--foreground))"
          strokeWidth={0.5}
          strokeDasharray="4 2"
          opacity={0.6}
        />
      </svg>
    </div>
  );
}
