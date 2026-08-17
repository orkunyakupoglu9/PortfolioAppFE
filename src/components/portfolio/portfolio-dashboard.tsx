"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AddPositionModal } from "@/components/portfolio/add-position-modal";
import { AppSidebar } from "@/components/portfolio/app-sidebar";
import { DashboardHeader } from "@/components/portfolio/dashboard-header";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { PortfolioChart } from "@/components/portfolio/portfolio-chart";
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary";
import { Watchlist } from "@/components/portfolio/watchlist";
import { Icon } from "@/components/ui/icon";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { ToastViewport, type ToastMessage } from "@/components/ui/toast";
import { useMarketStream } from "@/hooks/use-market-stream";
import { addWatchlistItem, createPosition, getPortfolio, getWatchlist, removePosition, removeWatchlistItem } from "@/lib/portfolio-api";
import { currencyFormatter, formatPercent } from "@/lib/format";
import { positionValue, worstPerformer } from "@/lib/portfolio-metrics";
import type { CreatePositionRequest, MarketUpdate, PerformanceFilter, PortfolioPosition, SortDirection, SortKey, WatchlistItem } from "@/types/portfolio";

export function PortfolioDashboard() {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [performance, setPerformance] = useState<PerformanceFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removingTicker, setRemovingTicker] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const notify = useCallback((message: Omit<ToastMessage, "id">) => setToasts((current) => [...current, { ...message, id: Date.now() + Math.random() }].slice(-3)), []);

  const refreshPortfolio = useCallback(async () => {
    setIsRefreshing(true);
    setLoadError(null);
    try {
      const data = await getPortfolio();
      setPositions(data);
      notify({ title: "Portfolio updated", description: "Prices and positions are up to date.", variant: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load portfolio.";
      notify({ title: "Refresh failed", description: message, variant: "error" });
    } finally {
      setIsRefreshing(false);
    }
  }, [notify]);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([getPortfolio(), getWatchlist()]).then(([portfolioResult, watchlistResult]) => {
      if (cancelled) return;
      if (portfolioResult.status === "fulfilled") setPositions(portfolioResult.value);
      else setLoadError(portfolioResult.reason instanceof Error ? portfolioResult.reason.message : "Could not load portfolio.");
      if (watchlistResult.status === "fulfilled") setWatchlist(watchlistResult.value);
      else notify({ title: "Watchlist unavailable", description: watchlistResult.reason instanceof Error ? watchlistResult.reason.message : "Could not load watchlist.", variant: "error" });
      setIsWatchlistLoading(false);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [notify]);

  async function retryInitialLoad() {
    setIsLoading(true);
    setLoadError(null);
    try { setPositions(await getPortfolio()); }
    catch (error) { setLoadError(error instanceof Error ? error.message : "Could not load portfolio."); }
    finally { setIsLoading(false); }
  }

  const applyMarketUpdate = useCallback((update: MarketUpdate) => {
    setPositions((current) => current.map((position) => {
      if (position.ticker !== update.ticker) return position;
      const nextPrice = update.isDelta ? position.currentPrice * (1 + update.currentPrice) : update.currentPrice;
      return {
        ...position,
        currentPrice: Math.max(0.01, nextPrice),
        changePercent: update.isDelta ? position.changePercent + update.changePercent : update.changePercent,
        volume: update.isDelta ? position.volume + update.volume : update.volume,
        sparkline: [...position.sparkline.slice(1), Math.max(0.01, nextPrice)],
        lastUpdated: update.timestamp,
      };
    }));
  }, []);

  const connectionState = useMarketStream({ symbols: positions.map((position) => position.ticker), onUpdate: applyMarketUpdate });
  const sectors = useMemo(() => [...new Set(positions.map((position) => position.sector))].sort(), [positions]);

  const visiblePositions = useMemo(() => {
    const term = query.trim().toLowerCase();
    return positions
      .filter((position) => !term || position.ticker.toLowerCase().includes(term) || position.companyName.toLowerCase().includes(term))
      .filter((position) => sector === "all" || position.sector === sector)
      .filter((position) => performance === "all" || (performance === "gainers" ? position.changePercent >= 0 : position.changePercent < 0))
      .sort((left, right) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        if (sortKey === "ticker") return left.ticker.localeCompare(right.ticker) * direction;
        const values: Record<Exclude<SortKey, "ticker">, [number, number]> = {
          price: [left.currentPrice, right.currentPrice], change: [left.changePercent, right.changePercent], value: [positionValue(left), positionValue(right)], volume: [left.volume, right.volume],
        };
        return (values[sortKey][0] - values[sortKey][1]) * direction;
      });
  }, [performance, positions, query, sector, sortDirection, sortKey]);

  async function handleAdd(request: CreatePositionRequest): Promise<boolean> {
    setIsAdding(true);
    try {
      await createPosition(request);
      const [nextPositions, nextWatchlist] = await Promise.all([getPortfolio(), getWatchlist()]);
      setPositions(nextPositions); setWatchlist(nextWatchlist); setAddModalOpen(false);
      notify({ title: `${request.ticker} added`, description: `${request.shares} shares are now in your portfolio.`, variant: "success" });
      return true;
    } catch (error) {
      notify({ title: "Could not add holding", description: error instanceof Error ? error.message : "Please try again.", variant: "error" });
      return false;
    } finally { setIsAdding(false); }
  }

  async function handleRemove(ticker: string) {
    setRemovingTicker(ticker);
    try {
      await removePosition(ticker);
      setPositions((current) => current.filter((position) => position.ticker !== ticker));
      notify({ title: `${ticker} removed`, description: "The holding was removed from your portfolio.", variant: "success" });
    } catch (error) { notify({ title: "Could not remove holding", description: error instanceof Error ? error.message : "Please try again.", variant: "error" }); }
    finally { setRemovingTicker(null); }
  }

  async function handleWatchlistRemove(ticker: string) {
    try { await removeWatchlistItem(ticker); setWatchlist((current) => current.filter((item) => item.ticker !== ticker)); }
    catch (error) { notify({ title: "Could not update watchlist", description: error instanceof Error ? error.message : "Please try again.", variant: "error" }); }
  }

  async function handleWatchlistAdd(ticker: string): Promise<boolean> {
    try {
      await addWatchlistItem(ticker);
      setWatchlist(await getWatchlist());
      notify({ title: `${ticker} is on your watchlist`, variant: "success" });
      return true;
    } catch (error) {
      notify({ title: "Could not update watchlist", description: error instanceof Error ? error.message : "Please try again.", variant: "error" });
      return false;
    }
  }

  const worst = worstPerformer(positions);

  return (
    <div>
      <AppSidebar />
      <div className="lg:pl-[228px]">
        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8 xl:p-10">
          {isLoading ? <DashboardSkeleton /> : loadError ? <ErrorState message={loadError} onRetry={() => void retryInitialLoad()} /> : (
            <div className="space-y-5 md:space-y-6">
              <DashboardHeader connectionState={connectionState} isRefreshing={isRefreshing} onAdd={() => setAddModalOpen(true)} onRefresh={() => void refreshPortfolio()} />
              <PortfolioSummary positions={positions} />
              <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
                <PortfolioChart positions={positions} />
                <div className="space-y-4">
                  <Watchlist items={watchlist} isLoading={isWatchlistLoading} onAdd={handleWatchlistAdd} onRemove={handleWatchlistRemove} />
                  {worst ? <aside className="overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/[.08] to-transparent p-5"><div className="flex items-center gap-2 text-brand"><Icon name="bolt" className="h-4 w-4" /><p className="text-[11px] font-bold uppercase tracking-wider">Portfolio insight</p></div><p className="mt-3 text-sm font-semibold">Keep an eye on {worst.ticker}</p><p className="mt-1 text-xs leading-5 text-subtle">It&apos;s today&apos;s lowest performer at <span className={worst.changePercent < 0 ? "text-negative" : "text-positive"}>{formatPercent(worst.changePercent)}</span>, representing {currencyFormatter.format(positionValue(worst))} of your portfolio.</p></aside> : null}
                </div>
              </div>
              <HoldingsTable positions={visiblePositions} query={query} sector={sector} sectors={sectors} performance={performance} sortKey={sortKey} sortDirection={sortDirection} removingTicker={removingTicker} onQueryChange={setQuery} onSectorChange={setSector} onPerformanceChange={setPerformance} onSortChange={(key, direction) => { setSortKey(key); setSortDirection(direction); }} onRemove={handleRemove} />
              <footer className="flex flex-col items-center justify-between gap-2 py-2 text-[10px] text-subtle sm:flex-row"><p>Demo market data · Prices update every few seconds</p><p className="inline-flex items-center gap-1.5"><Icon name="wifi" className="h-3 w-3 text-positive" /> {connectionState === "live" ? "Connected to live WebSocket" : "WebSocket-ready simulated feed"}</p></footer>
            </div>
          )}
        </div>
      </div>
      <AddPositionModal open={addModalOpen} isSubmitting={isAdding} onClose={() => setAddModalOpen(false)} onSubmit={handleAdd} />
      <ToastViewport messages={toasts} onDismiss={dismissToast} />
    </div>
  );
}
