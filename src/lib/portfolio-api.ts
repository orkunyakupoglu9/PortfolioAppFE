import {
  historicalPriceResponseSchema,
  marketQuoteSchema,
  portfolioHoldingSchema,
  portfolioSummarySchema,
  watchlistItemSchema,
  watchlistResponseSchema,
} from "@/lib/portfolio-schema";
import type {
  CreatePositionRequest,
  HistoricalPriceResponse,
  MarketQuote,
  ApiSortDirection,
  PortfolioHolding,
  PortfolioSortField,
  PortfolioSummary,
  UpdatePositionRequest,
  WatchlistItem,
} from "@/types/portfolio";

type PortfolioQuery = {
  search?: string;
  sortBy?: PortfolioSortField;
  direction?: ApiSortDirection;
};

type ApiErrorBody = {
  code?: string;
  message?: string;
  validationErrors?: Record<string, string>;
};

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    const fieldMessage = body.validationErrors
      ? Object.values(body.validationErrors)[0]
      : undefined;
    return (
      fieldMessage ??
      body.message ??
      `Request failed with status ${response.status}.`
    );
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

async function expectJson(response: Response): Promise<unknown> {
  if (!response.ok) throw new Error(await getErrorMessage(response));
  return response.json() as Promise<unknown>;
}

export async function getPortfolio(
  query: PortfolioQuery = {},
): Promise<PortfolioSummary> {
  const search = new URLSearchParams();
  if (query.search) search.set("search", query.search);
  if (query.sortBy) search.set("sortBy", query.sortBy);
  if (query.direction) search.set("direction", query.direction);
  const queryString = search.toString();
  const payload = await expectJson(
    await fetch(`/api/portfolio${queryString ? `?${queryString}` : ""}`, {
      cache: "no-store",
    }),
  );
  return portfolioSummarySchema.parse(payload);
}

export async function getMarketQuote(ticker: string): Promise<MarketQuote> {
  const payload = await expectJson(
    await fetch(`/api/market-data/${encodeURIComponent(ticker)}`, {
      cache: "no-store",
    }),
  );
  return marketQuoteSchema.parse(payload);
}

export async function getHolding(ticker: string): Promise<PortfolioHolding> {
  const payload = await expectJson(
    await fetch(`/api/portfolio/${encodeURIComponent(ticker)}`, {
      cache: "no-store",
    }),
  );
  return portfolioHoldingSchema.parse(payload);
}

export async function createPosition(
  request: CreatePositionRequest,
): Promise<PortfolioHolding> {
  const payload = await expectJson(
    await fetch("/api/portfolio", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
    }),
  );
  return portfolioHoldingSchema.parse(payload);
}

export async function updatePosition(
  ticker: string,
  request: UpdatePositionRequest,
): Promise<PortfolioHolding> {
  const payload = await expectJson(
    await fetch(`/api/portfolio/${encodeURIComponent(ticker)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
    }),
  );
  return portfolioHoldingSchema.parse(payload);
}

export async function removePosition(ticker: string): Promise<void> {
  const response = await fetch(`/api/portfolio/${encodeURIComponent(ticker)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(await getErrorMessage(response));
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const payload = await expectJson(
    await fetch("/api/watchlist", { cache: "no-store" }),
  );
  return watchlistResponseSchema.parse(payload);
}

export async function addWatchlistItem(ticker: string): Promise<WatchlistItem> {
  const payload = await expectJson(
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ticker }),
    }),
  );
  return watchlistItemSchema.parse(payload);
}

export async function removeWatchlistItem(ticker: string): Promise<void> {
  const response = await fetch(`/api/watchlist/${encodeURIComponent(ticker)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(await getErrorMessage(response));
}

export async function getHistoricalPrices(
  ticker: string,
  range: string,
  interval: string,
): Promise<HistoricalPriceResponse> {
  const search = new URLSearchParams({ range, interval });
  const payload = await expectJson(
    await fetch(
      `/api/market-data/${encodeURIComponent(ticker)}/history?${search}`,
      { cache: "no-store" },
    ),
  );
  return historicalPriceResponseSchema.parse(payload);
}
