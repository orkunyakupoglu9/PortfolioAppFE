"use client";

import { FormEvent, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { currencyFormatter, formatPercent } from "@/lib/format";
import type { WatchlistItem } from "@/types/portfolio";

export function Watchlist({
  items,
  isLoading,
  onAdd,
  onRemove,
}: {
  items: WatchlistItem[];
  isLoading: boolean;
  onAdd: (ticker: string) => Promise<boolean>;
  onRemove: (ticker: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [ticker, setTicker] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const symbol = ticker.trim().toUpperCase();
    if (!symbol) return;
    if (await onAdd(symbol)) {
      setTicker("");
      setAdding(false);
    }
  }

  return (
    <aside className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">Watchlist</h2>
          <p className="mt-1 text-[11px] text-subtle">
            Markets you&apos;re following
          </p>
        </div>
        <button
          onClick={() => setAdding((current) => !current)}
          className="grid h-8 w-8 place-items-center rounded-lg bg-brand/10 text-brand hover:bg-brand/20"
          aria-label="Add symbol to watchlist"
        >
          <Icon name={adding ? "x" : "plus"} />
        </button>
      </div>
      {adding ? (
        <form
          onSubmit={submit}
          className="flex gap-2 border-b border-line bg-raised/60 p-3"
        >
          <label className="sr-only" htmlFor="watchlist-symbol">
            Watchlist symbol
          </label>
          <input
            id="watchlist-symbol"
            autoFocus
            value={ticker}
            onChange={(event) => setTicker(event.target.value.toUpperCase())}
            placeholder="Symbol (e.g. TSLA)"
            className="field !h-9 min-w-0 !text-xs"
            maxLength={10}
          />
          <button className="button-primary !h-9 !px-3 !text-xs">Add</button>
        </form>
      ) : null}
      <div className="divide-y divide-line">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-[17px]">
              <div className="skeleton h-8 w-8" />
              <div className="flex-1">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton mt-2 h-2 w-24" />
              </div>
              <div className="skeleton h-5 w-14" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="px-5 py-12 text-center text-xs text-subtle">
            Your watchlist is empty.
          </div>
        ) : (
          items.map((item) => {
            const positive = item.changePercentage >= 0;
            return (
              <div
                key={item.id}
                className="group flex items-center gap-3 px-5 py-3.5 transition hover:bg-raised/60"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-raised text-[10px] font-bold text-ink">
                  {item.ticker.slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">{item.ticker}</p>
                  <p className="truncate text-[10px] text-subtle">
                    {item.companyName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">
                    {currencyFormatter.format(item.currentPrice)}
                  </p>
                  <p
                    className={`mt-0.5 text-[10px] font-semibold ${positive ? "text-positive" : "text-negative"}`}
                  >
                    {formatPercent(item.changePercentage)}
                  </p>
                </div>
                <button
                  onClick={() => void onRemove(item.ticker)}
                  className="rounded-md p-1 text-subtle opacity-60 hover:text-negative focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`Remove ${item.ticker} from watchlist`}
                >
                  <Icon name="x" className="h-3 w-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
      <button className="flex w-full items-center justify-center gap-1.5 border-t border-line px-5 py-3.5 text-[11px] font-semibold text-brand hover:bg-brand/5">
        View all markets <Icon name="arrow-right" className="h-3 w-3" />
      </button>
    </aside>
  );
}
