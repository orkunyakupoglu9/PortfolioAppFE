import { Icon } from "@/components/ui/icon";
import {
  compactNumberFormatter,
  currencyFormatter,
  formatPercent,
  formatSignedCurrency,
} from "@/lib/format";
import type {
  PerformanceFilter,
  PortfolioHolding,
  SortDirection,
  SortKey,
} from "@/types/portfolio";

type HoldingsTableProps = {
  positions: PortfolioHolding[];
  query: string;
  performance: PerformanceFilter;
  sortKey: SortKey;
  sortDirection: SortDirection;
  isSorting: boolean;
  removingTicker: string | null;
  onQueryChange: (value: string) => void;
  onPerformanceChange: (value: PerformanceFilter) => void;
  onSortChange: (
    key: SortKey,
    direction: SortDirection,
  ) => void | Promise<void>;
  onEdit: (position: PortfolioHolding) => void;
  onRemove: (ticker: string) => Promise<void>;
};

function SymbolMark({ ticker }: { ticker: string }) {
  const colors: Record<string, string> = {
    AAPL: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900",
    MSFT: "bg-blue-500 text-white",
    GOOGL: "bg-red-500 text-white",
    NVDA: "bg-emerald-600 text-white",
    TSLA: "bg-red-600 text-white",
  };
  return (
    <span
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[11px] font-bold ${colors[ticker] ?? "bg-brand/15 text-brand"}`}
    >
      {ticker.slice(0, 2)}
    </span>
  );
}

export function HoldingsTable(props: HoldingsTableProps) {
  const {
    positions,
    query,
    performance,
    sortKey,
    sortDirection,
    isSorting,
    removingTicker,
    onQueryChange,
    onPerformanceChange,
    onSortChange,
    onEdit,
    onRemove,
  } = props;
  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-line p-5 md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-base font-semibold">Your holdings</h2>
            <p className="mt-1 text-xs text-subtle">
              Live prices and performance from the portfolio service
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <label className="relative col-span-2 sm:w-56">
              <span className="sr-only">Search holdings</span>
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-subtle"
              />
              <input
                type="search"
                className="field !h-10 !pl-9"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search symbol or name"
              />
            </label>
            <select
              className="field !h-10 !w-auto min-w-28"
              aria-label="Filter by performance"
              value={performance}
              onChange={(event) =>
                onPerformanceChange(event.target.value as PerformanceFilter)
              }
            >
              <option value="all">All moves</option>
              <option value="gainers">Gainers</option>
              <option value="losers">Losers</option>
            </select>
            <div className="relative col-span-2 sm:col-auto">
              <select
                className="field !h-10 !w-full min-w-36 disabled:cursor-wait sm:!w-auto"
                aria-label="Sort holdings"
                aria-busy={isSorting}
                disabled={isSorting}
                value={`${sortKey}:${sortDirection}`}
                onChange={(event) => {
                  const [key, direction] = event.target.value.split(":") as [
                    SortKey,
                    SortDirection,
                  ];
                  void onSortChange(key, direction);
                }}
              >
                <option value="value:desc">Value: high to low</option>
                <option value="value:asc">Value: low to high</option>
                <option value="change:desc">Change: high to low</option>
                <option value="change:asc">Change: low to high</option>
                <option value="price:desc">Price: high to low</option>
                <option value="volume:desc">Volume: high to low</option>
                <option value="ticker:asc">Symbol: A–Z</option>
              </select>
              {isSorting ? (
                <Icon
                  name="refresh"
                  className="pointer-events-none absolute right-8 top-3 h-4 w-4 animate-spin text-brand"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="grid min-h-64 place-items-center px-5 py-12 text-center">
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-raised text-subtle">
              <Icon name="search" className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold">No holdings found</h3>
            <p className="mt-1 text-xs text-subtle">
              Adjust your filters or add a new position.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="bg-raised/60 text-[10px] font-semibold uppercase tracking-wider text-subtle">
                  <th className="px-6 py-3">Asset</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">24h change</th>
                  <th className="px-4 py-3">Daily P&amp;L</th>
                  <th className="px-4 py-3">Shares</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3 text-right">Market value</th>
                  <th className="w-24 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {positions.map((position) => {
                  const positive = position.changePercentage >= 0;
                  return (
                    <tr
                      key={position.id}
                      className="group transition hover:bg-raised/55"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <SymbolMark ticker={position.ticker} />
                          <div>
                            <p className="text-sm font-semibold">
                              {position.ticker}
                            </p>
                            <p className="mt-0.5 max-w-36 truncate text-[11px] text-subtle">
                              {position.companyName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        {currencyFormatter.format(position.currentPrice)}
                      </td>
                      <td
                        className={`px-4 py-4 text-xs font-semibold ${positive ? "text-positive" : "text-negative"}`}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Icon
                            name={positive ? "arrow-up" : "arrow-down"}
                            className="h-3 w-3"
                          />
                          {formatPercent(position.changePercentage)}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-4 text-xs font-semibold ${position.dailyProfitLoss >= 0 ? "text-positive" : "text-negative"}`}
                      >
                        {formatSignedCurrency(position.dailyProfitLoss)}
                      </td>
                      <td className="px-4 py-4 text-sm text-subtle">
                        {position.shares}
                      </td>
                      <td className="px-4 py-4 text-sm text-subtle">
                      {position.volume === null
                        ? "—"
                        : compactNumberFormatter.format(position.volume)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-semibold">
                        {currencyFormatter.format(position.marketValue)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => onEdit(position)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-subtle opacity-70 transition hover:bg-brand/10 hover:text-brand group-hover:opacity-100"
                            aria-label={`Edit ${position.ticker} shares`}
                          >
                            <Icon name="sliders" className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => void onRemove(position.ticker)}
                            disabled={removingTicker === position.ticker}
                            className="grid h-8 w-8 place-items-center rounded-lg text-subtle opacity-70 transition hover:bg-negative/10 hover:text-negative group-hover:opacity-100 disabled:opacity-40"
                            aria-label={`Remove ${position.ticker}`}
                          >
                            <Icon
                              name={
                                removingTicker === position.ticker
                                  ? "refresh"
                                  : "trash"
                              }
                              className={`h-4 w-4 ${removingTicker === position.ticker ? "animate-spin" : ""}`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-line md:hidden">
            {positions.map((position) => {
              const positive = position.changePercentage >= 0;
              return (
                <article key={position.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <SymbolMark ticker={position.ticker} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">
                            {position.ticker}
                          </p>
                          <p className="truncate text-[11px] text-subtle">
                            {position.companyName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {currencyFormatter.format(position.marketValue)}
                          </p>
                          <p
                            className={`mt-0.5 text-[11px] font-semibold ${positive ? "text-positive" : "text-negative"}`}
                          >
                            {formatPercent(position.changePercentage)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <div className="flex gap-6 text-[11px] text-subtle">
                          <span>
                            <b className="mb-1 block font-medium text-ink">
                              {position.shares}
                            </b>
                            Shares
                          </span>
                          <span>
                            <b className="mb-1 block font-medium text-ink">
                              {currencyFormatter.format(position.currentPrice)}
                            </b>
                            Price
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onEdit(position)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-brand/10 hover:text-brand"
                            aria-label={`Edit ${position.ticker} shares`}
                          >
                            <Icon name="sliders" />
                          </button>
                          <button
                            onClick={() => void onRemove(position.ticker)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-negative/10 hover:text-negative"
                            aria-label={`Remove ${position.ticker}`}
                          >
                            <Icon name="trash" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
