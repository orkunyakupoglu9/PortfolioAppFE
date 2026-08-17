import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary";
import {
  appleHolding,
  portfolioSummaryFixture,
} from "@/components/portfolio/__tests__/fixtures/portfolio";

describe("PortfolioSummary", () => {
  it("renders backend totals and derives the largest allocation", () => {
    render(<PortfolioSummary summary={portfolioSummaryFixture} />);

    expect(screen.getByText("$4,000.00")).toBeInTheDocument();
    expect(screen.getByText("+$20.00")).toBeInTheDocument();
    expect(screen.getByText("2 active holdings")).toBeInTheDocument();
    expect(screen.getByText("+50% of portfolio")).toBeInTheDocument();
    expect(screen.getByText("+2.04% today")).toBeInTheDocument();
  });

  it("renders safe empty states when there are no holdings", () => {
    render(
      <PortfolioSummary
        summary={{
          ...portfolioSummaryFixture,
          portfolio: [],
          totalValue: 0,
          totalDailyProfitLoss: 0,
          totalDailyChangePercentage: 0,
          bestPerformer: null,
          worstPerformer: null,
        }}
      />,
    );

    expect(screen.getByText("0 active holdings")).toBeInTheDocument();
    expect(screen.getAllByText("No holdings yet")).toHaveLength(2);
    expect(screen.queryByText(appleHolding.ticker)).not.toBeInTheDocument();
  });
});
