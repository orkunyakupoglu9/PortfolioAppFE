export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${numberFormatter.format(value)}%`;
}

export function formatSignedCurrency(value: number): string {
  const formatted = currencyFormatter.format(Math.abs(value));
  if (value === 0) return formatted;
  return `${value > 0 ? "+" : "−"}${formatted}`;
}
