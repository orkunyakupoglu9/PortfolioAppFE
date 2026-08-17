import type { PortfolioPosition, WatchlistItem } from "@/types/portfolio";

type MarketQuote = Omit<PortfolioPosition, "shares" | "averagePrice" | "lastUpdated">;

const marketCatalog: Record<string, MarketQuote> = {
  AAPL: { ticker: "AAPL", companyName: "Apple Inc.", sector: "Technology", currentPrice: 232.14, previousClose: 228.82, changePercent: 1.45, volume: 48_320_400, sparkline: [214, 218, 216, 221, 219, 224, 226, 223, 229, 227, 232] },
  MSFT: { ticker: "MSFT", companyName: "Microsoft Corp.", sector: "Technology", currentPrice: 418.79, previousClose: 421.57, changePercent: -0.66, volume: 19_870_100, sparkline: [407, 411, 409, 415, 417, 423, 420, 426, 424, 421, 419] },
  GOOGL: { ticker: "GOOGL", companyName: "Alphabet Inc.", sector: "Communication", currentPrice: 196.42, previousClose: 192.58, changePercent: 1.99, volume: 27_410_700, sparkline: [181, 184, 183, 186, 190, 188, 191, 190, 194, 193, 196] },
  NVDA: { ticker: "NVDA", companyName: "NVIDIA Corp.", sector: "Technology", currentPrice: 181.32, previousClose: 176.57, changePercent: 2.69, volume: 162_830_900, sparkline: [160, 164, 162, 168, 166, 171, 169, 174, 173, 177, 181] },
  TSLA: { ticker: "TSLA", companyName: "Tesla Inc.", sector: "Consumer Cyclical", currentPrice: 339.18, previousClose: 346.32, changePercent: -2.06, volume: 91_420_300, sparkline: [362, 357, 360, 351, 354, 347, 350, 344, 347, 342, 339] },
  AMZN: { ticker: "AMZN", companyName: "Amazon.com Inc.", sector: "Consumer Cyclical", currentPrice: 221.47, previousClose: 218.73, changePercent: 1.25, volume: 34_820_500, sparkline: [208, 210, 213, 211, 215, 217, 214, 219, 218, 220, 221] },
  JPM: { ticker: "JPM", companyName: "JPMorgan Chase & Co.", sector: "Financial Services", currentPrice: 292.63, previousClose: 291.78, changePercent: 0.29, volume: 8_910_400, sparkline: [284, 286, 285, 289, 287, 291, 290, 293, 291, 292, 293] },
  KO: { ticker: "KO", companyName: "The Coca-Cola Company", sector: "Consumer Defensive", currentPrice: 76.38, previousClose: 76.84, changePercent: -0.6, volume: 13_240_100, sparkline: [74, 75, 74.5, 75.3, 76, 75.7, 76.4, 76.8, 76.5, 76.7, 76.4] },
};

type MockStore = { positions: PortfolioPosition[]; watchlist: WatchlistItem[] };
const now = () => new Date().toISOString();

function makePosition(ticker: string, shares: number, averagePrice: number): PortfolioPosition {
  return { ...marketCatalog[ticker], shares, averagePrice, lastUpdated: now() };
}

function initialStore(): MockStore {
  return {
    positions: [makePosition("AAPL", 100, 183.4), makePosition("MSFT", 50, 356.18), makePosition("GOOGL", 25, 151.62), makePosition("NVDA", 40, 112.25)],
    watchlist: ["TSLA", "AMZN", "JPM", "KO"].map((ticker) => {
      const quote = marketCatalog[ticker];
      return { ticker: quote.ticker, companyName: quote.companyName, currentPrice: quote.currentPrice, changePercent: quote.changePercent };
    }),
  };
}

const globalStore = globalThis as typeof globalThis & { __financialPortfolioMockStore?: MockStore };
const store = globalStore.__financialPortfolioMockStore ?? initialStore();
globalStore.__financialPortfolioMockStore = store;

export function getMockPortfolio(): PortfolioPosition[] {
  return structuredClone(store.positions);
}

export function addMockPosition(tickerInput: string, shares: number, averagePrice?: number): PortfolioPosition {
  const ticker = tickerInput.toUpperCase();
  const existing = store.positions.find((position) => position.ticker === ticker);
  if (existing) {
    const combinedCost = existing.averagePrice * existing.shares + (averagePrice ?? existing.currentPrice) * shares;
    existing.shares += shares;
    existing.averagePrice = combinedCost / existing.shares;
    existing.lastUpdated = now();
    return structuredClone(existing);
  }
  const quote = marketCatalog[ticker];
  if (!quote) throw new Error("Symbol is not available in the demo market catalog.");
  const position = makePosition(ticker, shares, averagePrice ?? quote.currentPrice);
  store.positions.unshift(position);
  store.watchlist = store.watchlist.filter((item) => item.ticker !== ticker);
  return structuredClone(position);
}

export function removeMockPosition(tickerInput: string): boolean {
  const index = store.positions.findIndex((position) => position.ticker === tickerInput.toUpperCase());
  if (index < 0) return false;
  store.positions.splice(index, 1);
  return true;
}

export function getMockWatchlist(): WatchlistItem[] {
  return structuredClone(store.watchlist);
}

export function addMockWatchlistItem(tickerInput: string): WatchlistItem {
  const ticker = tickerInput.toUpperCase();
  const existing = store.watchlist.find((item) => item.ticker === ticker);
  if (existing) return structuredClone(existing);
  const quote = marketCatalog[ticker];
  if (!quote) throw new Error("Symbol is not available in the demo market catalog.");
  const item = { ticker: quote.ticker, companyName: quote.companyName, currentPrice: quote.currentPrice, changePercent: quote.changePercent };
  store.watchlist.push(item);
  return structuredClone(item);
}

export function removeMockWatchlistItem(tickerInput: string): boolean {
  const index = store.watchlist.findIndex((item) => item.ticker === tickerInput.toUpperCase());
  if (index < 0) return false;
  store.watchlist.splice(index, 1);
  return true;
}
