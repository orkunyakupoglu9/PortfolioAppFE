"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { currencyFormatter, formatPercent } from "@/lib/format";
import { getHistoricalPrices } from "@/lib/portfolio-api";
import type {
  ChartPeriod,
  HistoricalPriceResponse,
  PortfolioHolding,
} from "@/types/portfolio";

const periods: ChartPeriod[] = ["1D", "1W", "1M", "1Y"];
const periodConfig: Record<ChartPeriod, { range: string; interval: string }> = {
  "1D": { range: "1d", interval: "5m" },
  "1W": { range: "5d", interval: "1h" },
  "1M": { range: "1mo", interval: "1d" },
  "1Y": { range: "1y", interval: "1wk" },
};

function aggregateHistory(
  positions: PortfolioHolding[],
  histories: HistoricalPriceResponse[],
): number[] {
  const matchedSeries = histories.flatMap((history) => {
    const position = positions.find(
      (holding) => holding.ticker === history.ticker,
    );
    return position ? [{ history, position }] : [];
  });

  if (matchedSeries.length === 0) return [];
  const pointCount = Math.min(
    ...matchedSeries.map(({ history }) => history.prices.length),
  );
  return Array.from({ length: pointCount }, (_, index) =>
    matchedSeries.reduce((total, { history, position }) => {
      const prices = history.prices.slice(-pointCount);
      return total + prices[index].close * position.shares;
    }, 0),
  );
}

export function PortfolioChart({
  positions,
}: {
  positions: PortfolioHolding[];
}) {
  const [period, setPeriod] = useState<ChartPeriod>("1M");
  const [histories, setHistories] = useState<HistoricalPriceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const holdingsKey = positions
    .map((position) => `${position.ticker}:${position.shares}`)
    .join(",");

  useEffect(() => {
    let cancelled = false;
    const config = periodConfig[period];
    Promise.all(
      positions.map((position) =>
        getHistoricalPrices(position.ticker, config.range, config.interval),
      ),
    )
      .then((result) => {
        if (!cancelled) {
          setHistories(result);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((caughtError: unknown) => {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Historical prices are unavailable.",
          );
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [holdingsKey, period, positions, retry]);

  const values = useMemo(
    () => aggregateHistory(positions, histories),
    [histories, positions],
  );
  const width = 760;
  const height = 220;
  const padding = 10;
  const rawMin = values.length ? Math.min(...values) : 0;
  const rawMax = values.length ? Math.max(...values) : 1;
  const min = values.length ? rawMin * 0.995 : rawMin;
  const max = values.length ? rawMax * 1.005 : rawMax;
  const range = max - min || 1;
  const points = values.map((value, index) => ({
    x:
      padding +
      (index / Math.max(values.length - 1, 1)) * (width - padding * 2),
    y: padding + (1 - (value - min) / range) * (height - padding * 2),
  }));
  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`,
    )
    .join(" ");
  const areaPath = points.length
    ? `${path} L${points.at(-1)?.x},${height} L${points[0].x},${height} Z`
    : "";
  const start = values[0] ?? 0;
  const end = values.at(-1) ?? 0;
  const change = start === 0 ? 0 : ((end - start) / start) * 100;

  function selectPeriod(nextPeriod: ChartPeriod) {
    setIsLoading(true);
    setError(null);
    setPeriod(nextPeriod);
  }
  function retryLoad() {
    setIsLoading(true);
    setError(null);
    setRetry((current) => current + 1);
  }

  return (
    <section className="panel min-w-0 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Portfolio performance</h2>
            <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
              USD
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <strong className="text-2xl font-bold tracking-[-0.04em]">
              {isLoading ? "—" : currencyFormatter.format(end)}
            </strong>
            {!isLoading && !error ? (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${change >= 0 ? "text-positive" : "text-negative"}`}
              >
                <Icon
                  name={change >= 0 ? "arrow-up" : "arrow-down"}
                  className="h-3 w-3"
                />
                {formatPercent(change)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex rounded-xl bg-raised p-1">
          {periods.map((item) => (
            <button
              key={item}
              onClick={() => selectPeriod(item)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${period === item ? "bg-panel text-ink shadow-sm" : "text-subtle hover:text-ink"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div
          className="mt-6 h-[245px] w-full skeleton"
          aria-label="Loading historical portfolio data"
        />
      ) : error ? (
        <div className="grid h-[245px] place-items-center text-center">
          <div>
            <Icon name="chart" className="mx-auto h-6 w-6 text-subtle" />
            <p className="mt-3 text-xs text-subtle">{error}</p>
            <button
              onClick={retryLoad}
              className="button-secondary mt-4 !h-8 !text-xs"
            >
              <Icon name="refresh" className="h-3 w-3" /> Retry chart
            </button>
          </div>
        </div>
      ) : values.length > 1 ? (
        <div
          className="mt-5 overflow-hidden"
          aria-label={`${period} portfolio line chart`}
          role="img"
        >
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-[220px] w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="portfolioArea" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0"
                  stopColor="rgb(var(--brand))"
                  stopOpacity=".25"
                />
                <stop
                  offset="1"
                  stopColor="rgb(var(--brand))"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((fraction) => (
              <line
                key={fraction}
                x1="0"
                x2={width}
                y1={height * fraction}
                y2={height * fraction}
                stroke="rgb(var(--line))"
                strokeWidth="1"
                strokeDasharray="4 5"
              />
            ))}
            <path d={areaPath} fill="url(#portfolioArea)" />
            <path
              d={path}
              fill="none"
              stroke="rgb(var(--brand))"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.length ? (
              <circle
                cx={points.at(-1)?.x}
                cy={points.at(-1)?.y}
                r="5"
                fill="rgb(var(--panel))"
                stroke="rgb(var(--brand))"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>
          <div className="mt-1 flex justify-between text-[10px] font-medium text-subtle">
            <span>Start</span>
            <span>Mid-period</span>
            <span>Latest close</span>
          </div>
        </div>
      ) : (
        <div className="grid h-[245px] place-items-center text-sm text-subtle">
          No historical prices are available.
        </div>
      )}
    </section>
  );
}
