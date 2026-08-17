"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AddPositionModal } from "@/components/portfolio/add-position-modal";
import { AppSidebar } from "@/components/portfolio/app-sidebar";
import { DashboardHeader } from "@/components/portfolio/dashboard-header";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import {
  PopularStocks,
  POPULAR_STOCKS,
} from "@/components/portfolio/popular-stocks";
import { PortfolioChart } from "@/components/portfolio/portfolio-chart";
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary";
import { UpdatePositionModal } from "@/components/portfolio/update-position-modal";
import { Watchlist } from "@/components/portfolio/watchlist";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { Icon } from "@/components/ui/icon";
import { ToastViewport, type ToastMessage } from "@/components/ui/toast";
import { useMarketStream } from "@/hooks/use-market-stream";
import {
  addWatchlistItem,
  createPosition,
  getMarketQuote,
  getPortfolio,
  getWatchlist,
  removePosition,
  removeWatchlistItem,
  updatePosition,
} from "@/lib/portfolio-api";
import { currencyFormatter, formatPercent } from "@/lib/format";
import type {
  CreatePositionRequest,
  MarketQuote,
  PerformanceFilter,
  PortfolioHolding,
  PortfolioSummary as PortfolioSummaryData,
  PortfolioSortField,
  SortDirection,
  SortKey,
  WatchlistItem,
} from "@/types/portfolio";

const SORT_FIELD_BY_KEY: Record<SortKey, PortfolioSortField> = {
  ticker: "TICKER",
  price: "PRICE",
  change: "CHANGE_PERCENTAGE",
  value: "MARKET_VALUE",
  volume: "VOLUME",
};

function portfolioSortQuery(key: SortKey, direction: SortDirection) {
  return {
    sortBy: SORT_FIELD_BY_KEY[key],
    direction: direction === "asc" ? ("ASC" as const) : ("DESC" as const),
  };
}

function popularQuoteError(loadedCount: number): string | null {
  if (loadedCount === POPULAR_STOCKS.length) return null;
  return loadedCount === 0
    ? "Popular stock quotes are unavailable."
    : "Some popular stock quotes are unavailable.";
}

export function PortfolioDashboard() {
  const [summary, setSummary] = useState<PortfolioSummaryData | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [popularQuotes, setPopularQuotes] = useState<MarketQuote[]>([]);
  const [query, setQuery] = useState("");
  const [performance, setPerformance] = useState<PerformanceFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(true);
  const [isPopularLoading, setIsPopularLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] =
    useState<PortfolioHolding | null>(null);
  const [removingTicker, setRemovingTicker] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [popularError, setPopularError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback(
    (id: number) =>
      setToasts((current) => current.filter((toast) => toast.id !== id)),
    [],
  );
  const notify = useCallback(
    (message: Omit<ToastMessage, "id">) =>
      setToasts((current) =>
        [...current, { ...message, id: Date.now() + Math.random() }].slice(-3),
      ),
    [],
  );
  const handleStreamPortfolio = useCallback(
    (portfolio: PortfolioSummaryData) => {
      setSummary(portfolio);
      setLoadError(null);
      setIsLoading(false);
    },
    [],
  );
  const handleStreamError = useCallback(
    (message: string) =>
      notify({
        title: "Live update unavailable",
        description: message,
        variant: "error",
      }),
    [notify],
  );
  const connectionState = useMarketStream({
    onPortfolio: handleStreamPortfolio,
    onError: handleStreamError,
  });
  const positions = useMemo(() => summary?.portfolio ?? [], [summary]);

  const loadPopularStocks = useCallback(async () => {
    setIsPopularLoading(true);
    setPopularError(null);
    const results = await Promise.allSettled(
      POPULAR_STOCKS.map(({ ticker }) => getMarketQuote(ticker)),
    );
    const quotes = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    setPopularQuotes(quotes);
    setPopularError(popularQuoteError(quotes.length));
    setIsPopularLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled(
      POPULAR_STOCKS.map(({ ticker }) => getMarketQuote(ticker)),
    ).then((results) => {
      if (cancelled) return;
      const quotes = results.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      setPopularQuotes(quotes);
      setPopularError(popularQuoteError(quotes.length));
      setIsPopularLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      getPortfolio(portfolioSortQuery("value", "desc")),
      getWatchlist(),
    ]).then(
      ([portfolioResult, watchlistResult]) => {
        if (cancelled) return;
        if (portfolioResult.status === "fulfilled")
          setSummary(portfolioResult.value);
        else
          setLoadError(
            portfolioResult.reason instanceof Error
              ? portfolioResult.reason.message
              : "Could not load portfolio.",
          );
        if (watchlistResult.status === "fulfilled")
          setWatchlist(watchlistResult.value);
        else
          notify({
            title: "Watchlist unavailable",
            description:
              watchlistResult.reason instanceof Error
                ? watchlistResult.reason.message
                : "Could not load watchlist.",
            variant: "error",
          });
        setIsWatchlistLoading(false);
        setIsLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [notify]);

  const refreshPortfolio = useCallback(
    async (showToast = true) => {
      setIsRefreshing(true);
      try {
        setSummary(
          await getPortfolio(portfolioSortQuery(sortKey, sortDirection)),
        );
        setLoadError(null);
        if (showToast)
          notify({
            title: "Portfolio updated",
            description: "Live quotes and positions are up to date.",
            variant: "success",
          });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load portfolio.";
        if (!summary) setLoadError(message);
        else
          notify({
            title: "Refresh failed",
            description: message,
            variant: "error",
          });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [notify, sortDirection, sortKey, summary],
  );

  async function handleSortChange(key: SortKey, direction: SortDirection) {
    setSortKey(key);
    setSortDirection(direction);
    setIsSorting(true);
    try {
      setSummary(await getPortfolio(portfolioSortQuery(key, direction)));
      setLoadError(null);
    } catch (error) {
      notify({
        title: "Could not sort holdings",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsSorting(false);
    }
  }

  const visiblePositions = useMemo(() => {
    const term = query.trim().toLowerCase();
    return positions
      .filter(
        (position) =>
          !term ||
          position.ticker.toLowerCase().includes(term) ||
          position.companyName.toLowerCase().includes(term),
      )
      .filter(
        (position) =>
          performance === "all" ||
          (performance === "gainers"
            ? position.changePercentage >= 0
            : position.changePercentage < 0),
      )
      .sort((left, right) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        if (sortKey === "ticker")
          return left.ticker.localeCompare(right.ticker) * direction;
        const values: Record<Exclude<SortKey, "ticker">, [number, number]> = {
          price: [left.currentPrice, right.currentPrice],
          change: [left.changePercentage, right.changePercentage],
          value: [left.marketValue, right.marketValue],
          volume: [left.volume ?? 0, right.volume ?? 0],
        };
        return (values[sortKey][0] - values[sortKey][1]) * direction;
      });
  }, [performance, positions, query, sortDirection, sortKey]);

  async function handleAdd(request: CreatePositionRequest): Promise<boolean> {
    setIsAdding(true);
    try {
      await createPosition(request);
      const [nextSummary, nextWatchlist] = await Promise.all([
        getPortfolio(portfolioSortQuery(sortKey, sortDirection)),
        getWatchlist(),
      ]);
      setSummary(nextSummary);
      setWatchlist(nextWatchlist);
      setAddModalOpen(false);
      notify({
        title: `${request.ticker} added`,
        description: `${request.shares} shares are now in your portfolio.`,
        variant: "success",
      });
      return true;
    } catch (error) {
      notify({
        title: "Could not add holding",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
      return false;
    } finally {
      setIsAdding(false);
    }
  }

  async function handleUpdate(shares: number): Promise<boolean> {
    if (!editingPosition) return false;
    setIsUpdating(true);
    try {
      await updatePosition(editingPosition.ticker, { shares });
      setSummary(
        await getPortfolio(portfolioSortQuery(sortKey, sortDirection)),
      );
      notify({
        title: `${editingPosition.ticker} updated`,
        description: `Share quantity changed to ${shares}.`,
        variant: "success",
      });
      setEditingPosition(null);
      return true;
    } catch (error) {
      notify({
        title: "Could not update holding",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRemove(ticker: string) {
    setRemovingTicker(ticker);
    try {
      await removePosition(ticker);
      setSummary(
        await getPortfolio(portfolioSortQuery(sortKey, sortDirection)),
      );
      notify({
        title: `${ticker} removed`,
        description: "The holding was removed from your portfolio.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "Could not remove holding",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setRemovingTicker(null);
    }
  }

  async function handleWatchlistRemove(ticker: string) {
    try {
      await removeWatchlistItem(ticker);
      setWatchlist((current) =>
        current.filter((item) => item.ticker !== ticker),
      );
    } catch (error) {
      notify({
        title: "Could not update watchlist",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    }
  }

  async function handleWatchlistAdd(ticker: string): Promise<boolean> {
    try {
      const item = await addWatchlistItem(ticker);
      setWatchlist((current) =>
        [...current.filter((entry) => entry.ticker !== item.ticker), item].sort(
          (a, b) => a.ticker.localeCompare(b.ticker),
        ),
      );
      notify({ title: `${ticker} is on your watchlist`, variant: "success" });
      return true;
    } catch (error) {
      notify({
        title: "Could not update watchlist",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
      return false;
    }
  }

  return (
    <div>
      <AppSidebar />
      <div className="lg:pl-[228px]">
        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8 xl:p-10">
          {isLoading ? (
            <DashboardSkeleton />
          ) : loadError || !summary ? (
            <ErrorState
              message={loadError ?? "Portfolio data is unavailable."}
              onRetry={() => void refreshPortfolio(false)}
            />
          ) : (
            <div className="space-y-5 md:space-y-6">
              <DashboardHeader
                connectionState={connectionState}
                isRefreshing={isRefreshing}
                onAdd={() => setAddModalOpen(true)}
                onRefresh={() => void refreshPortfolio()}
              />
              <PopularStocks
                quotes={popularQuotes}
                portfolioTickers={positions.map((position) => position.ticker)}
                watchlistTickers={watchlist.map((item) => item.ticker)}
                isLoading={isPopularLoading}
                error={popularError}
                onRetry={() => void loadPopularStocks()}
                onAdd={handleWatchlistAdd}
              />
              <PortfolioSummary summary={summary} />
              <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
                <PortfolioChart positions={positions} />
                <div className="space-y-4">
                  <Watchlist
                    items={watchlist}
                    isLoading={isWatchlistLoading}
                    onAdd={handleWatchlistAdd}
                    onRemove={handleWatchlistRemove}
                  />
                  {summary.worstPerformer ? (
                    <aside className="overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/[.08] to-transparent p-5">
                      <div className="flex items-center gap-2 text-brand">
                        <Icon name="bolt" className="h-4 w-4" />
                        <p className="text-[11px] font-bold uppercase tracking-wider">
                          Portfolio insight
                        </p>
                      </div>
                      <p className="mt-3 text-sm font-semibold">
                        Keep an eye on {summary.worstPerformer.ticker}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-subtle">
                        It&apos;s today&apos;s lowest performer at{" "}
                        <span
                          className={
                            summary.worstPerformer.changePercentage < 0
                              ? "text-negative"
                              : "text-positive"
                          }
                        >
                          {formatPercent(
                            summary.worstPerformer.changePercentage,
                          )}
                        </span>
                        , representing{" "}
                        {currencyFormatter.format(
                          summary.worstPerformer.marketValue,
                        )}{" "}
                        of your portfolio.
                      </p>
                    </aside>
                  ) : null}
                </div>
              </div>
              <HoldingsTable
                positions={visiblePositions}
                query={query}
                performance={performance}
                sortKey={sortKey}
                sortDirection={sortDirection}
                isSorting={isSorting}
                removingTicker={removingTicker}
                onQueryChange={setQuery}
                onPerformanceChange={setPerformance}
                onSortChange={handleSortChange}
                onEdit={setEditingPosition}
                onRemove={handleRemove}
              />
              <footer className="flex flex-col items-center justify-between gap-2 py-2 text-[10px] text-subtle sm:flex-row">
                <p>
                  Live Yahoo Finance data · As of{" "}
            <time suppressHydrationWarning>
                    {new Date(summary.asOf).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </p>
                <p className="inline-flex items-center gap-1.5">
                  <Icon
                    name="wifi"
                    className={`h-3 w-3 ${connectionState === "live" ? "text-positive" : "text-negative"}`}
                  />{" "}
                  {connectionState === "live"
                    ? "Connected to portfolio stream"
                    : "Reconnecting to portfolio stream"}
                </p>
              </footer>
            </div>
          )}
        </div>
      </div>
      <AddPositionModal
        open={addModalOpen}
        isSubmitting={isAdding}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAdd}
      />
      {editingPosition ? (
        <UpdatePositionModal
          key={editingPosition.ticker}
          position={editingPosition}
          isSubmitting={isUpdating}
          onClose={() => setEditingPosition(null)}
          onSubmit={handleUpdate}
        />
      ) : null}
      <ToastViewport messages={toasts} onDismiss={dismissToast} />
    </div>
  );
}
