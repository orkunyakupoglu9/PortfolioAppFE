"use client";

import { FormEvent, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { PortfolioHolding } from "@/types/portfolio";

export function UpdatePositionModal({
  position,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  position: PortfolioHolding;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (shares: number) => Promise<boolean>;
}) {
  const [shares, setShares] = useState(String(position.shares));
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number(shares);
    if (!/^\d+(\.\d{1,6})?$/.test(shares) || parsed <= 0)
      return setError("Shares must be positive with at most 6 decimals.");
    setError(null);
    await onSubmit(parsed);
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-end p-0 sm:place-items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-position-title"
    >
      <button
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        onClick={isSubmitting ? undefined : onClose}
        aria-label="Close edit holding dialog"
      />
      <section className="relative w-full animate-fade-up rounded-t-3xl border border-line bg-panel p-6 shadow-2xl sm:max-w-sm sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Portfolio holding</p>
            <h2
              id="update-position-title"
              className="mt-1 text-xl font-bold tracking-[-0.03em]"
            >
              Update {position.ticker}
            </h2>
            <p className="mt-2 text-xs leading-5 text-subtle">
              Replace the share quantity for this holding.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line text-subtle hover:bg-raised"
            aria-label="Close dialog"
          >
            <Icon name="x" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold">Shares</span>
            <input
              autoFocus
              className="field"
              type="number"
              min="0.000001"
              step="0.000001"
              value={shares}
              onChange={(event) => setShares(event.target.value)}
            />
          </label>
          {error ? (
            <p
              className="rounded-xl bg-negative/10 px-3 py-2 text-xs text-negative"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <button
            disabled={isSubmitting}
            className="button-primary !h-11 w-full"
          >
            {isSubmitting ? (
              <>
                <Icon name="refresh" className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
