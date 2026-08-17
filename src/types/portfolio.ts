export type PortfolioHolding = {
  id: string;
  ticker: string;
  companyName: string;
  shares: number;
  currency: string;
  currentPrice: number;
  previousClose: number;
  priceChange: number;
  changePercentage: number;
  volume: number | null;
  marketValue: number;
  dailyProfitLoss: number;
  marketTime: string;
};

export type PortfolioSummary = {
  portfolio: PortfolioHolding[];
  totalValue: number;
  totalDailyProfitLoss: number;
  totalDailyChangePercentage: number;
  bestPerformer: PortfolioHolding | null;
  worstPerformer: PortfolioHolding | null;
  asOf: string;
};

export type WatchlistItem = {
  id: string;
  ticker: string;
  companyName: string;
  currency: string;
  currentPrice: number;
  previousClose: number;
  priceChange: number;
  changePercentage: number;
  volume: number | null;
  marketTime: string;
};

export type MarketQuote = Omit<WatchlistItem, "id">;

export type HistoricalPricePoint = {
  timestamp: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number | null;
};

export type HistoricalPriceResponse = {
  ticker: string;
  currency: string;
  range: string;
  interval: string;
  prices: HistoricalPricePoint[];
};

export type PortfolioUpdateEvent = {
  type: "PORTFOLIO_UPDATE" | "PORTFOLIO_UPDATE_ERROR";
  timestamp: string;
  portfolio: PortfolioSummary | null;
  errorCode: string | null;
  errorMessage: string | null;
};

export type CreatePositionRequest = { ticker: string; shares: number };
export type UpdatePositionRequest = { shares: number };
export type SortKey = "ticker" | "price" | "change" | "value" | "volume";
export type SortDirection = "asc" | "desc";
export type PortfolioSortField =
  | "TICKER"
  | "PRICE"
  | "CHANGE_PERCENTAGE"
  | "MARKET_VALUE"
  | "VOLUME";
export type ApiSortDirection = "ASC" | "DESC";
export type PerformanceFilter = "all" | "gainers" | "losers";
export type ConnectionState = "connecting" | "live" | "offline";
export type ChartPeriod = "1D" | "1W" | "1M" | "1Y";
