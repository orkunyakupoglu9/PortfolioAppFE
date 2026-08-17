import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddPositionForm } from "@/components/portfolio/add-position-form";

describe("AddPositionForm", () => {
  it("validates the ticker and share precision before submitting", () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<AddPositionForm isSubmitting={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Stock symbol"), {
      target: { value: "$bad" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add to portfolio" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid market symbol.",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("normalizes valid values and resets after a successful add", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<AddPositionForm isSubmitting={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Stock symbol"), {
      target: { value: " nvda " },
    });
    fireEvent.change(screen.getByLabelText("Shares"), {
      target: { value: "2.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add to portfolio" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ ticker: "NVDA", shares: 2.5 }),
    );
    await waitFor(() => expect(screen.getByLabelText("Stock symbol")).toHaveValue(""));
    expect(screen.getByLabelText("Shares")).toHaveValue(1);
  });
});
