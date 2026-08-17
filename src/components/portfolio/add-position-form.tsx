"use client";

import { FormEvent, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { CreatePositionRequest } from "@/types/portfolio";

export function AddPositionForm({
  isSubmitting,
  onSubmit,
}: {
  isSubmitting: boolean;
  onSubmit: (request: CreatePositionRequest) => Promise<boolean>;
}) {
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("1");
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTicker = ticker.trim().toUpperCase();
    const parsedShares = Number(shares);
    if (!/^[A-Z][A-Z0-9.-]{0,15}$/.test(normalizedTicker))
      return setValidationError("Enter a valid market symbol.");
    if (!/^\d+(\.\d{1,6})?$/.test(shares) || parsedShares <= 0)
      return setValidationError(
        "Shares must be positive with at most 6 decimals.",
      );
    setValidationError(null);
    const saved = await onSubmit({
      ticker: normalizedTicker,
      shares: parsedShares,
    });
    if (saved) {
      setTicker("");
      setShares("1");
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-ink">
          Stock symbol
        </span>
        <div className="relative">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-subtle"
          />
          <input
            autoFocus
            className="field !pl-10 uppercase"
            value={ticker}
            onChange={(event) => setTicker(event.target.value.toUpperCase())}
            placeholder="e.g. TSLA"
            maxLength={16}
            autoComplete="off"
          />
        </div>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold text-ink">
          Shares
        </span>
        <input
          className="field"
          type="number"
          min="0.000001"
          step="0.000001"
          value={shares}
          onChange={(event) => setShares(event.target.value)}
        />
      </label>
      <div>
        <p className="mb-2 text-[11px] font-medium text-subtle">
          Popular symbols
        </p>
        <div className="flex flex-wrap gap-2">
          {["TSLA", "AMZN", "JPM", "KO"].map((symbol) => (
            <button
              type="button"
              onClick={() => setTicker(symbol)}
              key={symbol}
              className="rounded-lg border border-line bg-raised px-2.5 py-1.5 text-[10px] font-semibold text-subtle hover:border-brand hover:text-brand"
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
      {validationError ? (
        <p
          className="rounded-xl bg-negative/10 px-3 py-2 text-xs text-negative"
          role="alert"
        >
          {validationError}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="button-primary !h-11 w-full"
      >
        {isSubmitting ? (
          <>
            <Icon name="refresh" className="h-4 w-4 animate-spin" /> Adding position…
          </>
        ) : (
          <>
            <Icon name="plus" /> Add to portfolio
          </>
        )}
      </button>
      <p className="text-center text-[10px] leading-4 text-subtle">
        The symbol is validated against live market data before it is saved.
      </p>
    </form>
  );
}
