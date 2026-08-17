import type {
  MarketQuote,
  PortfolioHolding,
  PortfolioSummary,
  WatchlistItem,
} from "@/types/portfolio";

export function mockHolding(
  overrides: Partial<PortfolioHolding> = {},
): PortfolioHolding {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    ticker: "AAPL",
    companyName: "Apple Inc.",
    shares: 10,
    currency: "USD",
    currentPrice: 200,
    previousClose: 196,
    priceChange: 4,
    changePercentage: 2.04,
    volume: 1_000_000,
    marketValue: 2_000,
    dailyProfitLoss: 40,
    marketTime: "2026-08-18T10:00:00Z",
    ...overrides,
  };
}

export function mockQuote(overrides: Partial<MarketQuote> = {}): MarketQuote {
  return {
    ticker: "NVDA",
    companyName: "NVIDIA Corporation",
    currency: "USD",
    currentPrice: 180,
    previousClose: 175,
    priceChange: 5,
    changePercentage: 2.86,
    volume: 2_000_000,
    marketTime: "2026-08-18T10:00:00Z",
    ...overrides,
  };
}

export function mockWatchlistItem(
  overrides: Partial<WatchlistItem> = {},
): WatchlistItem {
  return {
    id: "00000000-0000-0000-0000-000000000010",
    ...mockQuote({
      ticker: "MSFT",
      companyName: "Microsoft Corporation",
      ...overrides,
    }),
    ...overrides,
  };
}

export const appleHolding = mockHolding();
export const microsoftHolding = mockHolding({
  id: "00000000-0000-0000-0000-000000000002",
  ticker: "MSFT",
  companyName: "Microsoft Corporation",
  shares: 5,
  currentPrice: 400,
  previousClose: 404,
  priceChange: -4,
  changePercentage: -0.99,
  volume: 800_000,
  marketValue: 2_000,
  dailyProfitLoss: -20,
});

export const portfolioSummaryFixture: PortfolioSummary = {
  portfolio: [appleHolding, microsoftHolding],
  totalValue: 4_000,
  totalDailyProfitLoss: 20,
  totalDailyChangePercentage: 0.5,
  bestPerformer: appleHolding,
  worstPerformer: microsoftHolding,
  asOf: "2026-08-18T10:00:00Z",
};
