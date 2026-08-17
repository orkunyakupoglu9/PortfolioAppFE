"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { currencyFormatter, formatPercent } from "@/lib/format";
import type { MarketQuote } from "@/types/portfolio";

export const POPULAR_STOCKS = [
  { ticker: "AAPL", name: "Apple" },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "NVDA", name: "NVIDIA" },
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "GOOGL", name: "Alphabet" },
  { ticker: "META", name: "Meta" },
  { ticker: "TSLA", name: "Tesla" },
  { ticker: "NFLX", name: "Netflix" },
  { ticker: "JPM", name: "JPMorgan Chase" },
  { ticker: "KO", name: "Coca-Cola" },
] as const;

type PopularStocksProps = {
  quotes: MarketQuote[];
  portfolioTickers: string[];
  watchlistTickers: string[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onAdd: (ticker: string) => Promise<boolean>;
};

export function PopularStocks({
  quotes,
  portfolioTickers,
  watchlistTickers,
  isLoading,
  error,
  onRetry,
  onAdd,
}: PopularStocksProps) {
  const [addingTicker, setAddingTicker] = useState<string | null>(null);
  const quotesByTicker = new Map(quotes.map((quote) => [quote.ticker, quote]));

  async function addTicker(ticker: string) {
    setAddingTicker(ticker);
    try {
      await onAdd(ticker);
    } finally {
      setAddingTicker(null);
    }
  }

  return (
    <section className="panel overflow-hidden" aria-labelledby="popular-stocks-title">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="popular-stocks-title" className="text-sm font-semibold">
              Top 10 popular stocks
            </h2>
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand">
              Live quotes
            </span>
          </div>
          <p className="mt-1 text-[11px] text-subtle">
            10 widely followed companies to consider for your watchlist
          </p>
        </div>
        {error ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 self-start text-[11px] font-semibold text-negative hover:opacity-80 sm:self-auto"
          >
            <Icon name="refresh" className="h-3.5 w-3.5" />
            Retry unavailable quotes
          </button>
        ) : null}
      </div>

      <div className="flex snap-x gap-3 overflow-x-auto p-4 md:p-5">
        {POPULAR_STOCKS.map((stock, index) => {
          const quote = quotesByTicker.get(stock.ticker);
          const inPortfolio = portfolioTickers.includes(stock.ticker);
          const inWatchlist = watchlistTickers.includes(stock.ticker);
          const isAdding = addingTicker === stock.ticker;
          const positive = (quote?.changePercentage ?? 0) >= 0;

          return (
            <article
              key={stock.ticker}
              className="min-w-[184px] snap-start rounded-xl border border-line bg-raised/55 p-3.5 transition hover:-translate-y-0.5 hover:border-brand/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-panel text-[10px] font-bold text-ink shadow-sm">
                    {stock.ticker.slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold">{stock.ticker}</p>
                    <p className="truncate text-[10px] text-subtle">
                      {quote?.companyName ?? stock.name}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-semibold text-subtle">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {isLoading && !quote ? (
                <div className="mt-4" aria-label={`Loading ${stock.ticker} quote`}>
                  <div className="skeleton h-4 w-20" />
                  <div className="skeleton mt-2 h-3 w-12" />
                </div>
              ) : quote ? (
                <div className="mt-4 flex items-end justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {currencyFormatter.format(quote.currentPrice)}
                  </p>
                  <p
                    className={`text-[10px] font-semibold ${positive ? "text-positive" : "text-negative"}`}
                  >
                    {formatPercent(quote.changePercentage)}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-[10px] text-subtle">Quote unavailable</p>
              )}

              <button
                type="button"
                disabled={inPortfolio || inWatchlist || isAdding}
                onClick={() => void addTicker(stock.ticker)}
                className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-panel text-[10px] font-semibold text-ink transition hover:border-brand/40 hover:text-brand disabled:pointer-events-none disabled:bg-transparent disabled:text-subtle disabled:opacity-70"
                aria-label={
                  inPortfolio
                    ? `${stock.ticker} is already in your portfolio`
                    : inWatchlist
                      ? `${stock.ticker} is already on your watchlist`
                      : `Add ${stock.ticker} to watchlist`
                }
              >
                {isAdding ? (
                  <Icon name="refresh" className="h-3 w-3 animate-spin" />
                ) : !inPortfolio && !inWatchlist ? (
                  <Icon name="plus" className="h-3 w-3" />
                ) : null}
                {isAdding
                  ? "Adding…"
                  : inPortfolio
                    ? "In portfolio"
                    : inWatchlist
                      ? "Watching"
                      : "Watch"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
