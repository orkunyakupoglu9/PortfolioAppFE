export type PortfolioPosition = {
  ticker: string;
  companyName: string;
  sector: string;
  shares: number;
  currentPrice: number;
  previousClose: number;
  changePercent: number;
  averagePrice: number;
  volume: number;
  sparkline: number[];
  lastUpdated: string;
};

export type WatchlistItem = {
  ticker: string;
  companyName: string;
  currentPrice: number;
  changePercent: number;
};

export type CreatePositionRequest = {
  ticker: string;
  shares: number;
  averagePrice?: number;
};

export type MarketUpdate = {
  ticker: string;
  currentPrice: number;
  changePercent: number;
  volume: number;
  timestamp: string;
  isDelta?: boolean;
};

export type SortKey = "ticker" | "price" | "change" | "value" | "volume";
export type SortDirection = "asc" | "desc";
export type PerformanceFilter = "all" | "gainers" | "losers";
export type ConnectionState = "connecting" | "live" | "simulated" | "offline";
