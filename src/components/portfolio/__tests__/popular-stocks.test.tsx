import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PopularStocks } from "@/components/portfolio/popular-stocks";
import { mockQuote } from "@/components/portfolio/__tests__/fixtures/portfolio";

describe("PopularStocks", () => {
  it("shows portfolio and watchlist states and adds an eligible ticker", async () => {
    const onAdd = vi.fn().mockResolvedValue(true);
    render(
      <PopularStocks
        quotes={[
          mockQuote({ ticker: "AAPL", companyName: "Apple Inc." }),
          mockQuote({ ticker: "MSFT", companyName: "Microsoft Corporation" }),
          mockQuote(),
        ]}
        portfolioTickers={["AAPL"]}
        watchlistTickers={["MSFT"]}
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
        onAdd={onAdd}
      />,
    );

    expect(
      screen.getByRole("button", { name: "AAPL is already in your portfolio" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "MSFT is already on your watchlist" }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Add NVDA to watchlist" }));
    await waitFor(() => expect(onAdd).toHaveBeenCalledWith("NVDA"));
  });

  it("offers a retry when live quotes fail", () => {
    const onRetry = vi.fn();
    render(
      <PopularStocks
        quotes={[]}
        portfolioTickers={[]}
        watchlistTickers={[]}
        isLoading={false}
        error="Popular stock quotes are unavailable."
        onRetry={onRetry}
        onAdd={vi.fn().mockResolvedValue(false)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry unavailable quotes" }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getAllByText("Quote unavailable")).toHaveLength(10);
  });
});
