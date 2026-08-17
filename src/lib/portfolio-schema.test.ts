import { describe, expect, it } from "vitest";
import { portfolioSummarySchema, portfolioUpdateEventSchema } from "@/lib/portfolio-schema";

const holding = {
  id: "00000000-0000-0000-0000-000000000001",
  ticker: "AAPL",
  companyName: "Apple Inc.",
  shares: 100,
  currency: "USD",
  currentPrice: 232.14,
  previousClose: 228.82,
  priceChange: 3.32,
  changePercentage: 1.45,
  volume: 48_320_400,
  marketValue: 23_214,
  dailyProfitLoss: 332,
  marketTime: "2026-08-17T10:00:00Z",
};

const summary = {
  portfolio: [holding],
  totalValue: 23_214,
  totalDailyProfitLoss: 332,
  totalDailyChangePercentage: 1.45,
  bestPerformer: holding,
  worstPerformer: holding,
  asOf: "2026-08-17T10:00:00Z",
};

describe("backend contracts", () => {
  it("accepts the PortfolioSummaryResponse contract", () => expect(portfolioSummarySchema.parse(summary).portfolio[0].ticker).toBe("AAPL"));
  it("accepts the STOMP PortfolioUpdateEvent contract", () => expect(portfolioUpdateEventSchema.parse({ type: "PORTFOLIO_UPDATE", timestamp: "2026-08-17T10:00:01Z", portfolio: summary, errorCode: null, errorMessage: null }).portfolio?.totalValue).toBe(23_214));
});
