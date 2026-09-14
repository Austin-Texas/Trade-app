import React from "react";

// Lightweight SVG sparkline for inline price trends.
export default function Sparkline({ data, width = 80, height = 24, positive }) {
  if (!data || data.length < 2) return null;
  const values = data.map((d) => d.close);
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(" ");
  const stroke = positive ? "hsl(var(--bull))" : "hsl(var(--bear))";
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}