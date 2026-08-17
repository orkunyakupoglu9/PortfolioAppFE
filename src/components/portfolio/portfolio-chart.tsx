"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { currencyFormatter, formatPercent } from "@/lib/format";
import { portfolioHistory } from "@/lib/portfolio-metrics";
import type { PortfolioPosition } from "@/types/portfolio";

const periods = ["1D", "1W", "1M", "1Y"] as const;
type Period = (typeof periods)[number];
const periodPoints: Record<Period, number> = { "1D": 5, "1W": 7, "1M": 9, "1Y": 11 };

export function PortfolioChart({ positions }: { positions: PortfolioPosition[] }) {
  const [period, setPeriod] = useState<Period>("1M");
  const fullHistory = useMemo(() => portfolioHistory(positions), [positions]);
  const values = fullHistory.slice(-periodPoints[period]);
  const width = 760;
  const height = 220;
  const padding = 10;
  const rawMin = values.length ? Math.min(...values) : 0;
  const rawMax = values.length ? Math.max(...values) : 1;
  const min = values.length ? rawMin * 0.995 : rawMin;
  const max = values.length ? rawMax * 1.005 : rawMax;
  const range = max - min || 1;
  const points = values.map((value, index) => ({
    x: padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2),
    y: padding + (1 - (value - min) / range) * (height - padding * 2),
  }));
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const areaPath = points.length ? `${path} L${points.at(-1)?.x},${height} L${points[0].x},${height} Z` : "";
  const start = values[0] ?? 0;
  const end = values.at(-1) ?? 0;
  const change = start === 0 ? 0 : ((end - start) / start) * 100;

  return (
    <section className="panel min-w-0 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><h2 className="text-base font-semibold">Portfolio performance</h2><span className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">USD</span></div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <strong className="text-2xl font-bold tracking-[-0.04em]">{currencyFormatter.format(end)}</strong>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${change >= 0 ? "text-positive" : "text-negative"}`}><Icon name={change >= 0 ? "arrow-up" : "arrow-down"} className="h-3 w-3" />{formatPercent(change)}</span>
          </div>
        </div>
        <div className="flex rounded-xl bg-raised p-1">
          {periods.map((item) => <button key={item} onClick={() => setPeriod(item)} className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${period === item ? "bg-panel text-ink shadow-sm" : "text-subtle hover:text-ink"}`}>{item}</button>)}
        </div>
      </div>

      {values.length > 1 ? (
        <div className="mt-5 overflow-hidden" aria-label={`${period} portfolio line chart`} role="img">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="portfolioArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgb(var(--brand))" stopOpacity=".25" /><stop offset="1" stopColor="rgb(var(--brand))" stopOpacity="0" /></linearGradient>
            </defs>
            {[.25, .5, .75].map((fraction) => <line key={fraction} x1="0" x2={width} y1={height * fraction} y2={height * fraction} stroke="rgb(var(--line))" strokeWidth="1" strokeDasharray="4 5" />)}
            <path d={areaPath} fill="url(#portfolioArea)" />
            <path d={path} fill="none" stroke="rgb(var(--brand))" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            {points.length ? <circle cx={points.at(-1)?.x} cy={points.at(-1)?.y} r="5" fill="rgb(var(--panel))" stroke="rgb(var(--brand))" strokeWidth="3" vectorEffect="non-scaling-stroke" /> : null}
          </svg>
          <div className="mt-1 flex justify-between text-[10px] font-medium text-subtle"><span>Start</span><span>Mid-period</span><span>Today</span></div>
        </div>
      ) : <div className="grid h-[245px] place-items-center text-sm text-subtle">Add a holding to see performance.</div>}
    </section>
  );
}
