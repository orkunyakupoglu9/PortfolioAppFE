import { describe, expect, it } from "vitest";
import { bestPerformer, totalDayChange, totalPortfolioValue, worstPerformer } from "@/lib/portfolio-metrics";
import type { PortfolioHolding } from "@/types/portfolio";

const holding = (overrides: Partial<PortfolioHolding>): PortfolioHolding => ({
  id: "00000000-0000-0000-0000-000000000001",
  ticker: "AAPL",
  companyName: "Apple Inc.",
  shares: 10,
  currency: "USD",
  currentPrice: 200,
  previousClose: 196,
  priceChange: 4,
  changePercentage: 2,
  volume: 1_000,
  marketValue: 2_000,
  dailyProfitLoss: 40,
  marketTime: "2026-08-17T10:00:00.000Z",
  ...overrides,
});

const portfolio = [holding({}), holding({ id: "00000000-0000-0000-0000-000000000002", ticker: "MSFT", marketValue: 2_100, dailyProfitLoss: -20, changePercentage: -1 })];

describe("portfolio metrics", () => {
  it("sums backend-calculated market values", () => expect(totalPortfolioValue(portfolio)).toBe(4_100));
  it("sums backend-calculated daily profit and loss", () => expect(totalDayChange(portfolio)).toBe(20));
  it("finds the best performer", () => expect(bestPerformer(portfolio)?.ticker).toBe("AAPL"));
  it("finds the worst performer", () => expect(worstPerformer(portfolio)?.ticker).toBe("MSFT"));
});
