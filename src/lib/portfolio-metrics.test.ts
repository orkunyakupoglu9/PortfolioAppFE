import { describe, expect, it } from "vitest";
import {
  bestPerformer,
  totalPortfolioValue,
  totalProfitLoss,
} from "@/lib/portfolio-metrics";
import type { PortfolioPosition } from "@/types/portfolio";

const portfolio: PortfolioPosition[] = [
  {
    ticker: "AAPL",
    companyName: "Apple Inc.",
    sector: "Technology",
    shares: 10,
    currentPrice: 200,
    previousClose: 196,
    changePercent: 2,
    averagePrice: 150,
    volume: 1_000,
    sparkline: [190, 200],
    lastUpdated: "2026-08-17T10:00:00.000Z",
  },
  {
    ticker: "MSFT",
    companyName: "Microsoft Corp.",
    sector: "Technology",
    shares: 5,
    currentPrice: 400,
    previousClose: 404,
    changePercent: -1,
    averagePrice: 350,
    volume: 2_000,
    sparkline: [405, 400],
    lastUpdated: "2026-08-17T10:00:00.000Z",
  },
];

describe("portfolio metrics", () => {
  it("calculates total market value", () => {
    expect(totalPortfolioValue(portfolio)).toBe(4000);
  });

  it("calculates total profit and loss", () => {
    expect(totalProfitLoss(portfolio)).toBe(750);
  });

  it("finds the best performer", () => {
    expect(bestPerformer(portfolio)?.ticker).toBe("AAPL");
  });
});
