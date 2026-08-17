import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Watchlist } from "@/components/portfolio/watchlist";
import { mockWatchlistItem } from "@/components/portfolio/__tests__/fixtures/portfolio";

describe("Watchlist", () => {
  it("renders live items and forwards removal", () => {
    const onRemove = vi.fn().mockResolvedValue(undefined);
    render(
      <Watchlist
        items={[mockWatchlistItem()]}
        isLoading={false}
        onAdd={vi.fn().mockResolvedValue(true)}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText("Microsoft Corporation")).toBeInTheDocument();
    expect(screen.getByText("$180.00")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Remove MSFT from watchlist" }),
    );
    expect(onRemove).toHaveBeenCalledWith("MSFT");
  });

  it("normalizes a symbol and closes the form after a successful add", async () => {
    const onAdd = vi.fn().mockResolvedValue(true);
    render(
      <Watchlist
        items={[]}
        isLoading={false}
        onAdd={onAdd}
        onRemove={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add symbol to watchlist" }));
    const input = screen.getByRole("textbox", { name: "Watchlist symbol" });
    fireEvent.change(input, { target: { value: " nvda " } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(onAdd).toHaveBeenCalledWith("NVDA"));
    await waitFor(() =>
      expect(
        screen.queryByRole("textbox", { name: "Watchlist symbol" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("keeps the form open when the API rejects the add", async () => {
    const onAdd = vi.fn().mockResolvedValue(false);
    render(
      <Watchlist
        items={[]}
        isLoading={false}
        onAdd={onAdd}
        onRemove={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add symbol to watchlist" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Watchlist symbol" }), {
      target: { value: "NVDA" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(onAdd).toHaveBeenCalledWith("NVDA"));
    expect(screen.getByRole("textbox", { name: "Watchlist symbol" })).toHaveValue(
      "NVDA",
    );
  });
});
