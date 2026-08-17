import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import {
  appleHolding,
  microsoftHolding,
} from "@/components/portfolio/__tests__/fixtures/portfolio";

function renderTable(overrides: Partial<Parameters<typeof HoldingsTable>[0]> = {}) {
  const props: Parameters<typeof HoldingsTable>[0] = {
    positions: [appleHolding, microsoftHolding],
    query: "",
    performance: "all",
    sortKey: "value",
    sortDirection: "desc",
    isSorting: false,
    removingTicker: null,
    onQueryChange: vi.fn(),
    onPerformanceChange: vi.fn(),
    onSortChange: vi.fn(),
    onEdit: vi.fn(),
    onRemove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  render(<HoldingsTable {...props} />);
  return props;
}

describe("HoldingsTable", () => {
  it("renders backend holdings and forwards search and filter changes", () => {
    const props = renderTable();

    expect(screen.getAllByText("AAPL").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Microsoft Corporation").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search holdings" }), {
      target: { value: "apple" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Filter by performance" }), {
      target: { value: "gainers" },
    });

    expect(props.onQueryChange).toHaveBeenCalledWith("apple");
    expect(props.onPerformanceChange).toHaveBeenCalledWith("gainers");
  });

  it("requests server sorting and exposes holding actions", () => {
    const props = renderTable();

    fireEvent.change(screen.getByRole("combobox", { name: "Sort holdings" }), {
      target: { value: "price:desc" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Edit AAPL shares" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Remove MSFT" })[0]);

    expect(props.onSortChange).toHaveBeenCalledWith("price", "desc");
    expect(props.onEdit).toHaveBeenCalledWith(appleHolding);
    expect(props.onRemove).toHaveBeenCalledWith("MSFT");
  });

  it("disables the sorting control while a request is pending", () => {
    renderTable({ isSorting: true });
    expect(screen.getByRole("combobox", { name: "Sort holdings" })).toBeDisabled();
  });
});
