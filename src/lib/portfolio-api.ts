import { portfolioResponseSchema, watchlistResponseSchema } from "@/lib/portfolio-schema";
import type {
  CreatePositionRequest,
  PortfolioPosition,
  WatchlistItem,
} from "@/types/portfolio";

type ApiErrorBody = {
  message?: string;
};

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return body.message ?? `Request failed with status ${response.status}.`;
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

export async function getPortfolio(): Promise<PortfolioPosition[]> {
  const response = await fetch("/api/portfolio", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const payload: unknown = await response.json();
  return portfolioResponseSchema.parse(payload);
}

export async function createPosition(
  request: CreatePositionRequest,
): Promise<void> {
  const response = await fetch("/api/portfolio", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

export async function removePosition(ticker: string): Promise<void> {
  const response = await fetch(
    `/api/portfolio/${encodeURIComponent(ticker)}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const response = await fetch("/api/watchlist", { cache: "no-store" });
  if (!response.ok) throw new Error(await getErrorMessage(response));
  const payload: unknown = await response.json();
  return watchlistResponseSchema.parse(payload);
}

export async function addWatchlistItem(ticker: string): Promise<void> {
  const response = await fetch("/api/watchlist", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ticker }),
  });
  if (!response.ok) throw new Error(await getErrorMessage(response));
}

export async function removeWatchlistItem(ticker: string): Promise<void> {
  const response = await fetch(`/api/watchlist/${encodeURIComponent(ticker)}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await getErrorMessage(response));
}
