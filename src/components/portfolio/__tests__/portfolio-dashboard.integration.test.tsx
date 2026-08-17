import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortfolioDashboard } from "@/components/portfolio/portfolio-dashboard";
import { POPULAR_STOCKS } from "@/components/portfolio/popular-stocks";
import * as portfolioApi from "@/lib/portfolio-api";
import {
  mockQuote,
  mockWatchlistItem,
  portfolioSummaryFixture,
} from "@/components/portfolio/__tests__/fixtures/portfolio";

vi.mock("@/hooks/use-market-stream", () => ({
  useMarketStream: () => "live",
}));

vi.mock("@/lib/portfolio-api", () => ({
  addWatchlistItem: vi.fn(),
  createPosition: vi.fn(),
  getHistoricalPrices: vi.fn(),
  getMarketQuote: vi.fn(),
  getPortfolio: vi.fn(),
  getWatchlist: vi.fn(),
  removePosition: vi.fn(),
  removeWatchlistItem: vi.fn(),
  updatePosition: vi.fn(),
}));

const mockedApi = vi.mocked(portfolioApi);

describe("PortfolioDashboard integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.getPortfolio.mockResolvedValue(portfolioSummaryFixture);
    mockedApi.getWatchlist.mockResolvedValue([
      mockWatchlistItem({
        ticker: "TSLA",
        companyName: "Tesla, Inc.",
      }),
    ]);
    mockedApi.getMarketQuote.mockImplementation(async (ticker) =>
      mockQuote({
        ticker,
        companyName:
          POPULAR_STOCKS.find((stock) => stock.ticker === ticker)?.name ?? ticker,
      }),
    );
    mockedApi.getHistoricalPrices.mockImplementation(
      async (ticker, range, interval) => ({
        ticker,
        currency: "USD",
        range,
        interval,
        prices: [
          {
            timestamp: "2026-08-17T10:00:00Z",
            open: 190,
            high: 201,
            low: 189,
            close: 195,
            volume: 1_000,
          },
          {
            timestamp: "2026-08-18T10:00:00Z",
            open: 195,
            high: 205,
            low: 194,
            close: 200,
            volume: 1_200,
          },
        ],
      }),
    );
    mockedApi.addWatchlistItem.mockImplementation(async (ticker) =>
      mockWatchlistItem({
        id: "00000000-0000-0000-0000-000000000011",
        ticker,
        companyName: "NVIDIA Corporation",
      }),
    );
  });

  it("loads mocked backend data, calls server sorting, and updates the watchlist", async () => {
    render(<PortfolioDashboard />);

    expect(
      screen.getByRole("region", { name: "Loading portfolio dashboard" }),
    ).toBeInTheDocument();

    await screen.findByRole("heading", { name: /Good morning, Orkun/ });
    expect(mockedApi.getPortfolio).toHaveBeenCalledWith({
      sortBy: "MARKET_VALUE",
      direction: "DESC",
    });
    expect(screen.getByText("$4,000.00")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Top 10 popular stocks" })).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Sort holdings" }), {
      target: { value: "price:desc" },
    });
    await waitFor(() =>
      expect(mockedApi.getPortfolio).toHaveBeenLastCalledWith({
        sortBy: "PRICE",
        direction: "DESC",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Add NVDA to watchlist" }));
    await waitFor(() => expect(mockedApi.addWatchlistItem).toHaveBeenCalledWith("NVDA"));
    expect(
      await screen.findByRole("button", {
        name: "NVDA is already on your watchlist",
      }),
    ).toBeDisabled();
  });
});
