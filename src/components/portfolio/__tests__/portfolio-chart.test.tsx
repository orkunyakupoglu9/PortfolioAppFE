import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortfolioChart } from "@/components/portfolio/portfolio-chart";
import {
  appleHolding,
  microsoftHolding,
} from "@/components/portfolio/__tests__/fixtures/portfolio";
import { getHistoricalPrices } from "@/lib/portfolio-api";

vi.mock("@/lib/portfolio-api", () => ({
  getHistoricalPrices: vi.fn(),
}));

const mockedGetHistoricalPrices = vi.mocked(getHistoricalPrices);

function history(ticker: string, range = "1mo", interval = "1d") {
  return {
    ticker,
    currency: "USD",
    range,
    interval,
    prices: [
      {
        timestamp: "2026-08-17T10:00:00Z",
        open: 190,
        high: 195,
        low: 189,
        close: 190,
        volume: 1_000,
      },
      {
        timestamp: "2026-08-18T10:00:00Z",
        open: 195,
        high: 201,
        low: 194,
        close: 200,
        volume: 1_200,
      },
    ],
  };
}

describe("PortfolioChart", () => {
  beforeEach(() => vi.clearAllMocks());

  it("matches history by ticker and changes the backend period query", async () => {
    mockedGetHistoricalPrices.mockImplementation(async (ticker) =>
      ticker === "AAPL" ? history("MSFT") : history("UNKNOWN"),
    );

    render(<PortfolioChart positions={[appleHolding, microsoftHolding]} />);

    expect(
      await screen.findByRole("img", { name: "1M portfolio line chart" }),
    ).toBeInTheDocument();
    expect(screen.getByText("$1,000.00")).toBeInTheDocument();

    mockedGetHistoricalPrices.mockImplementation(async (ticker, range, interval) =>
      history(ticker, range, interval),
    );
    fireEvent.click(screen.getByRole("button", { name: "1W" }));

    await waitFor(() =>
      expect(mockedGetHistoricalPrices).toHaveBeenCalledWith("AAPL", "5d", "1h"),
    );

    fireEvent.click(screen.getByRole("button", { name: "3M" }));

    await waitFor(() =>
      expect(mockedGetHistoricalPrices).toHaveBeenCalledWith("AAPL", "3mo", "1d"),
    );
    expect(screen.getAllByText("Aug 17").length).toBeGreaterThan(0);
    expect(screen.getByText("$3,015")).toBeInTheDocument();
  });

  it("shows an error and retries failed history requests", async () => {
    mockedGetHistoricalPrices.mockRejectedValue(new Error("History unavailable"));
    render(<PortfolioChart positions={[appleHolding]} />);

    expect(await screen.findByText("History unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry chart" }));

    await waitFor(() => expect(mockedGetHistoricalPrices).toHaveBeenCalledTimes(2));
  });
});
